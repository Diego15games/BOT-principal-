import {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

import { executarBotoesXP } from '../panels/xpButtons.js';
import { painelPrincipal } from '../panels/painelPrincipal.js';
import { painelTicket } from '../panels/painelTicket.js';
import { painelTicket2 } from '../panels/painelTicket2.js';
import { painelTicket3 } from '../panels/painelTicket3.js';
import { painelTicketPublico } from '../panels/painelTicketPublico.js';
import {
  pegarPainelPublico,
  salvarCampoPainelPublico,
  montarPainelPublico,
  enviarPainelPublico,
  atualizarPainelPublico
} from '../systems/ticketPainel.js';
import { painelTicketLista } from '../panels/painelTicketLista.js';
import { gerarTranscript } from '../systems/transcript.js';
import { painelRegistro } from '../panels/painelRegistro.js';
import { painelStaff } from '../panels/painelStaff.js';
import { painelGeral } from '../panels/painelGeral.js';

import {
  pegarConfig,
  criarRegistro,
  salvarConfig
} from '../systems/registro.js';

import {
  LIMITE_TIPOS_TICKET,
  listarTiposTicket,
  pegarTipoTicket,
  criarTipoTicket,
  salvarCampoTicket,
  excluirTipoTicket,
  pegarConfigDoTicket,
  isTicketChannel,
  getTicketTipoId,
  assumirTicket,
  pegarAssumidoPor,
  removerTicket,
  getTicketCreatorId,
  podeFecharTicket,
  MSG_SEM_PERMISSAO_FECHAR
} from '../systems/tickets.js';

import {
  pegarConfigXP,
  salvarConfigXP
} from '../systems/xp.js';

import { salvarConfigStaff } from '../systems/staff.js';
import { db } from '../systems/database.js';

const serverConfigCollection = db.collection('serverConfig');

const privateReply = {
  flags: MessageFlags.Ephemeral
};

function staffRoleIds(config) {
  const valor = config?.staffRoleId;
  if (!valor) return [];
  const valores = Array.isArray(valor) ? valor : String(valor).split(/[\s,;]+/);
  return [...new Set(valores.map(item => String(item).replace(/^<@&?(\d+)>$/, '$1')).filter(item => /^\d{17,20}$/.test(item)))];
}

function memberIsStaff(member, config) {
  const ids = staffRoleIds(config);
  return ids.some(id => member?.roles?.cache?.has(id));
}


function makeModal(
  id,
  title,
  field,
  label,
  style = TextInputStyle.Short,
  oldValue = ''
) {
  const input = new TextInputBuilder()
    .setCustomId('valor')
    .setLabel(label.slice(0, 45))
    .setStyle(style)
    .setRequired(true)
    .setMaxLength(style === TextInputStyle.Paragraph ? 4000 : 1000);

  if (oldValue) input.setValue(String(oldValue).slice(0, 4000));

  return new ModalBuilder()
    .setCustomId(id)
    .setTitle(title.slice(0, 45))
    .addComponents(
      new ActionRowBuilder().addComponents(input)
    );
}

function criarBotoesFechamento() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_fechar_confirmar')
      .setLabel('Sim, resolver e fechar')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('ticket_fechar_cancelar')
      .setLabel('Não, voltar')
      .setEmoji('↩️')
      .setStyle(ButtonStyle.Secondary)
  );
}

// Formulário que a pessoa preenche para abrir um ticket de um tipo.
function modalCriarTicket(tipo) {
  return new ModalBuilder()
    .setCustomId(`ticket_criar_modal:${tipo.tipoId}`)
    .setTitle('Abrir ticket')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('nick')
          .setLabel('Seu nick no jogo')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('problema')
          .setLabel('Assunto')
          .setPlaceholder('Resuma o motivo do ticket')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('descricao')
          .setLabel('Descreva o problema')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(2000)
      )
    );
}

// Nome do ticket em formato de canal (ex.: "Denúncia" -> "denuncia").
function slugTicket(nome) {
  const slug = String(nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);

  return slug || 'ticket';
}

// O painel geral é uma mensagem fixa; as telas de dentro dele abrem como
// mensagem temporária (só quem clicou vê) e a navegação continua nela.
function abrirTela(interaction, payload) {
  const temporaria = interaction.message?.flags?.has(MessageFlags.Ephemeral);

  return temporaria
    ? interaction.update(payload)
    : interaction.reply({ ...payload, ...privateReply });
}

function valorTexto(valor) {
  return String(valor ?? '').trim();
}

export default {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    try {
      // COMANDOS SLASH
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        return await command.execute(interaction, client);
      }

      // MENU DE CONFIGURAÇÃO DO XP
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === 'xp_config_menu'
      ) {
        const escolha = interaction.values[0];

        const modais = {
          xp_cargo_modal: [
            'Configurar cargos XP',
            'Digite os cargos e valores'
          ],
          xp_canal_modal: [
            'Configurar canais XP',
            'Digite os canais e valores'
          ],
          xp_mensagem_modal: [
            'Mensagem de XP',
            'Digite a mensagem de XP'
          ],
          xp_cooldown_modal: [
            'Cooldown XP',
            'Digite o tempo em segundos'
          ]
        };

        if (modais[escolha]) {
          const [titulo, label] = modais[escolha];

          return interaction.showModal(
            makeModal(escolha, titulo, 'valor', label)
          );
        }

        return;
      }

      // MENU PÚBLICO: a pessoa escolhe qual ticket quer abrir
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === 'ticket_menu_abrir'
      ) {
        const tipoEscolhido = await pegarTipoTicket(
          interaction.guildId,
          interaction.values[0]
        );

        if (!tipoEscolhido?.staffRoleId) {
          return interaction.reply({
            content: '❌ Este tipo de ticket não está disponível.',
            ...privateReply
          });
        }

        await interaction.showModal(modalCriarTicket(tipoEscolhido));

        // Reedita o painel para o menu voltar ao texto "Tickets".
        interaction.message
          .edit({
            components: interaction.message.components.map(linha =>
              ActionRowBuilder.from(linha)
            )
          })
          .catch(() => {});

        return;
      }

      // MENU PARA ESCOLHER QUAL TICKET EDITAR
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === 'ticket_editar_menu'
      ) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
          return interaction.reply({
            content: '❌ Apenas administradores podem usar este painel.',
            ...privateReply
          });
        }

        const tipoEscolhido = await pegarTipoTicket(
          interaction.guildId,
          interaction.values[0]
        );

        if (!tipoEscolhido) {
          return abrirTela(interaction, 
            painelTicketLista(await listarTiposTicket(interaction.guildId))
          );
        }

        return abrirTela(interaction, painelTicket(tipoEscolhido));
      }

      // BOTÕES
      if (interaction.isButton()) {
        // O ID pode vir como "acao:idDoTicket".
        const [id, tipoParam] = interaction.customId.split(':');

        const botoesPainel = [
          'painel_principal',
          'painel_ticket',
          'ticket_pagina1',
          'ticket_pagina2',
          'ticket_pagina3',
          'ticket_novo',
          'ticket_excluir',
          'ticket_excluir_ok',
          'ticket_painel_publico',
          'tpub_canal',
          'tpub_titulo',
          'tpub_descricao',
          'tpub_banner',
          'tpub_cor',
          'tpub_placeholder',
          'tpub_preview',
          'tpub_enviar',
          'painel_registro',
          'painel_staff',
          'painel_geral',
          'painel_xp',
          'ticket_categoria',
          'ticket_staff',
          'ticket_logs',
          'ticket_titulo',
          'ticket_descricao',
          'ticket_banner',
          'ticket_cor',
          'ticket_botao',
          'ticket_emoji'
        ];

        const eConfiguracao = botoesPainel.includes(id);

        if (
          eConfiguracao &&
          !interaction.memberPermissions?.has(
            PermissionFlagsBits.ManageGuild
          )
        ) {
          return interaction.reply({
            content: '❌ Apenas administradores podem usar este painel.',
            ...privateReply
          });
        }

        // BOTÕES DO SISTEMA XP
        if (await executarBotoesXP(interaction)) return;

        // NAVEGAÇÃO DOS PAINÉIS
        const paineis = {
          painel_principal: painelPrincipal,
          painel_registro: painelRegistro,
          painel_staff: painelStaff,
          painel_geral: painelGeral
        };

        if (paineis[id]) {
          return abrirTela(interaction, paineis[id]());
        }

        // LISTA DE TICKETS
        if (id === 'painel_ticket') {
          return abrirTela(interaction, 
            painelTicketLista(await listarTiposTicket(interaction.guildId))
          );
        }

        // NOVO TICKET
        if (id === 'ticket_novo') {
          return interaction.showModal(
            makeModal(
              'ticket_novo_modal',
              'Novo ticket',
              'valor',
              'Nome do ticket (ex.: Denúncia)'
            )
          );
        }

        // PAINEL PÚBLICO ÚNICO
        if (id === 'ticket_painel_publico') {
          return abrirTela(
            interaction,
            painelTicketPublico(await pegarPainelPublico(interaction.guildId))
          );
        }

        const camposPainel = {
          tpub_canal: {
            campo: 'channelId',
            titulo: 'Canal do painel',
            label: 'ID do canal de texto'
          },
          tpub_titulo: {
            campo: 'titulo',
            titulo: 'Título do painel',
            label: 'Título'
          },
          tpub_descricao: {
            campo: 'descricao',
            titulo: 'Descrição do painel',
            label: 'Descrição',
            style: TextInputStyle.Paragraph
          },
          tpub_banner: {
            campo: 'banner',
            titulo: 'Banner do painel',
            label: 'URL da imagem'
          },
          tpub_cor: {
            campo: 'cor',
            titulo: 'Cor do painel',
            label: 'Cor hexadecimal (ex.: #5865F2)'
          },
          tpub_placeholder: {
            campo: 'placeholder',
            titulo: 'Texto do menu',
            label: 'Texto do menu (ex.: Tickets)'
          }
        };

        if (camposPainel[id]) {
          const item = camposPainel[id];
          const painelAtual = await pegarPainelPublico(interaction.guildId);

          return interaction.showModal(
            makeModal(
              `tpub_config_${item.campo}`,
              item.titulo,
              'valor',
              item.label,
              item.style || TextInputStyle.Short,
              painelAtual?.[item.campo] || ''
            )
          );
        }

        if (id === 'tpub_preview') {
          const { tipos, payload } = await montarPainelPublico(interaction.guildId);

          if (!tipos.length) {
            return interaction.reply({
              content: '❌ Crie pelo menos um ticket com cargo staff para ver o menu.',
              ...privateReply
            });
          }

          return interaction.reply({ ...payload, ...privateReply });
        }

        if (id === 'tpub_enviar') {
          const resultado = await enviarPainelPublico(interaction.guild);

          if (resultado.erro) {
            return interaction.reply({
              content: `❌ ${resultado.erro}`,
              ...privateReply
            });
          }

          return interaction.reply({
            content: resultado.atualizado
              ? `✅ Painel atualizado em ${resultado.canal}.`
              : `✅ Painel enviado para ${resultado.canal}.`,
            ...privateReply
          });
        }

        // Botões que editam um ticket específico.
        const idsDoTicket = [
          'ticket_pagina1', 'ticket_pagina2', 'ticket_pagina3',
          'ticket_excluir', 'ticket_excluir_ok',
          'ticket_categoria', 'ticket_staff', 'ticket_logs',
          'ticket_titulo', 'ticket_descricao', 'ticket_banner', 'ticket_cor',
          'ticket_botao', 'ticket_emoji'
        ];

        let config = null;

        if (idsDoTicket.includes(id)) {
          config = await pegarTipoTicket(interaction.guildId, tipoParam);

          if (!config) {
            return abrirTela(interaction, 
              painelTicketLista(await listarTiposTicket(interaction.guildId))
            );
          }
        }

        // PÁGINAS 1, 2 E 3 DO TICKET
        const paginasTicket = {
          ticket_pagina1: painelTicket,
          ticket_pagina2: painelTicket2,
          ticket_pagina3: painelTicket3
        };

        if (paginasTicket[id]) {
          return abrirTela(interaction, paginasTicket[id](config));
        }

        // EXCLUIR TICKET (pede confirmação)
        if (id === 'ticket_excluir') {
          const abertos = interaction.guild.channels.cache.filter(
            c =>
              isTicketChannel(c) &&
              (getTicketTipoId(c) || 'principal') === config.tipoId
          );

          if (abertos.size) {
            return interaction.reply({
              content: `❌ Existem ${abertos.size} ticket(s) abertos deste tipo. Feche todos antes de excluir.`,
              ...privateReply
            });
          }

          return abrirTela(interaction, {
            embeds: [
              new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🗑️ Excluir ticket')
                .setDescription(
                  `Excluir **${config.nome}**? O painel já enviado deixa de abrir tickets e essa ação não pode ser desfeita.`
                )
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`ticket_excluir_ok:${config.tipoId}`)
                  .setLabel('Sim, excluir')
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId(`ticket_pagina1:${config.tipoId}`)
                  .setLabel('Cancelar')
                  .setStyle(ButtonStyle.Secondary)
              )
            ]
          });
        }

        if (id === 'ticket_excluir_ok') {
          await excluirTipoTicket(interaction.guildId, config.tipoId);
          await atualizarPainelPublico(interaction.guild);

          return abrirTela(interaction, 
            painelTicketLista(await listarTiposTicket(interaction.guildId))
          );
        }

        // CONFIGURAÇÕES DOS TICKETS

        const camposTicket = {
          ticket_categoria: {
            campo: 'categoryId',
            titulo: 'Configurar categoria',
            label: 'ID da categoria'
          },
          ticket_staff: {
            campo: 'staffRoleId',
            titulo: 'Configurar cargo staff',
            label: 'ID do cargo staff'
          },
          ticket_logs: {
            campo: 'logChannelId',
            titulo: 'Configurar canal de logs',
            label: 'ID do canal de logs'
          },
          ticket_titulo: {
            campo: 'titulo',
            titulo: 'Título do painel',
            label: 'Título'
          },
          ticket_descricao: {
            campo: 'descricao',
            titulo: 'Descrição do painel',
            label: 'Descrição',
            style: TextInputStyle.Paragraph
          },
          ticket_banner: {
            campo: 'banner',
            titulo: 'Banner do painel',
            label: 'URL da imagem'
          },
          ticket_cor: {
            campo: 'cor',
            titulo: 'Cor do painel',
            label: 'Cor hexadecimal (ex.: #5865F2)'
          },
          ticket_botao: {
            campo: 'botao',
            titulo: 'Nome do botão',
            label: 'Texto do botão'
          },
          ticket_emoji: {
            campo: 'emoji',
            titulo: 'Emoji do botão',
            label: 'Emoji'
          }
        };

        if (camposTicket[id]) {
          const item = camposTicket[id];

          return interaction.showModal(
            makeModal(
              `ticket_config_${item.campo}:${config.tipoId}`,
              item.titulo,
              'valor',
              item.label,
              item.style || TextInputStyle.Short,
              config?.[item.campo] || ''
            )
          );
        }

        // ABRIR TICKET: só funciona no canal definido na configuração.
        if (id === 'ticket_abrir') {
          const configTicket = await pegarTipoTicket(
            interaction.guildId,
            tipoParam
          );

          if (!configTicket) {
            return interaction.reply({
              content: '❌ Este tipo de ticket não existe mais.',
              ...privateReply
            });
          }

          if (
            !configTicket.panelChannelId ||
            interaction.channelId !== configTicket.panelChannelId
          ) {
            return interaction.reply({
              content: '❌ Este painel não está no canal configurado para abrir tickets.',
              ...privateReply
            });
          }

          return interaction.showModal(modalCriarTicket(configTicket));
        }

        // ASSUMIR TICKET
        if (id === 'ticket_assumir') {
          const configTicket = await pegarConfigDoTicket(interaction.guildId, interaction.channel);

          if (
            !configTicket?.staffRoleId ||
            !memberIsStaff(interaction.member, configTicket)
          ) {
            return interaction.reply({
              content: '❌ Apenas o staff pode assumir tickets.',
              ...privateReply
            });
          }

          const assumidoPor = await assumirTicket(
            interaction.channelId,
            interaction.user.id
          );

          if (assumidoPor) {
            return interaction.reply({
              content: `❌ Este ticket já foi assumido por <@${assumidoPor}>.`,
              ...privateReply
            });
          }

          // Mexer nas permissões demora; avisa o Discord que já estamos
          // cuidando disso para a interação não expirar (limite de 3s).
          await interaction.deferReply();

          const playerId = getTicketCreatorId(interaction.channel);

          // Depois de assumir, o ticket fica restrito ao jogador e ao responsável.
          const alteracoes = staffRoleIds(configTicket).map(roleId =>
            interaction.channel.permissionOverwrites.edit(roleId, {
              ViewChannel: false,
              SendMessages: false,
              ReadMessageHistory: false
            })
          );

          alteracoes.push(
            interaction.channel.permissionOverwrites.edit(interaction.user.id, {
              ViewChannel: true,
              SendMessages: true,
              ReadMessageHistory: true,
              AttachFiles: true
            })
          );

          if (playerId) {
            alteracoes.push(
              interaction.channel.permissionOverwrites.edit(playerId, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true
              })
            );
          }

          await Promise.all(alteracoes);

          // Depois de assumir, o único botão público vira "Painel Staff".
          // Os demais botões aparecem só para a staff (mensagem privada).
          const componentesAtualizados = [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('ticket_painel_staff')
                .setLabel('Painel Staff')
                .setEmoji('🛠️')
                .setStyle(ButtonStyle.Primary)
            )
          ];

          await interaction.message.edit({
            components: componentesAtualizados
          });

          await interaction.editReply({
            content: `✅ Ticket assumido por ${interaction.user}. Agora só você, o jogador e os staffs adicionados conseguem ver este canal.`
          });

          if (configTicket?.logChannelId) {
            const logs = await interaction.guild.channels
              .fetch(configTicket?.logChannelId)
              .catch(() => null);

            if (logs?.isTextBased()) {
              await logs.send(
                `📌 ${interaction.user} assumiu o ticket ${interaction.channel}.`
              );
            }
          }

          return;
        }

        // PAINEL STAFF: botões de controle visíveis só para quem clicou
        if (id === 'ticket_painel_staff') {
          const configTicket = await pegarConfigDoTicket(interaction.guildId, interaction.channel);

          if (
            !configTicket?.staffRoleId ||
            !memberIsStaff(interaction.member, configTicket)
          ) {
            return interaction.reply({
              content: '❌ Apenas a staff pode usar este painel.',
              ...privateReply
            });
          }

          const linha1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_add_staff').setLabel('Add Staff').setEmoji('👥').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ticket_notificar_player').setLabel('Notificar Player').setEmoji('🔔').setStyle(ButtonStyle.Secondary)
          );

          const linha2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_trancar').setLabel('Trancar').setEmoji('🔐').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_fechar').setLabel('Encerrar').setEmoji('🔒').setStyle(ButtonStyle.Danger)
          );

          return interaction.reply({
            content: '🛠️ **Painel Staff** — só você vê esta mensagem.',
            components: [linha1, linha2],
            ...privateReply
          });
        }

        // ADICIONAR OUTRO MEMBRO DA STAFF AO TICKET
        if (id === 'ticket_add_staff') {
          const configTicket = await pegarConfigDoTicket(interaction.guildId, interaction.channel);
          const responsavelId = await pegarAssumidoPor(interaction.channelId);

          if (!configTicket?.staffRoleId ||
              !memberIsStaff(interaction.member, configTicket)) {
            return interaction.reply({
              content: '❌ Apenas a staff pode usar este botão.',
              ...privateReply
            });
          }

          if (!responsavelId) {
            return interaction.reply({
              content: '❌ Primeiro alguém da staff precisa assumir este ticket.',
              ...privateReply
            });
          }

          if (responsavelId !== interaction.user.id) {
            return interaction.reply({
              content: '❌ Somente quem assumiu este ticket pode adicionar outro staff.',
              ...privateReply
            });
          }

          const modal = new ModalBuilder()
            .setCustomId('ticket_add_staff_modal')
            .setTitle('Adicionar staff ao ticket')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('staff_mencao')
                  .setLabel('Mencione @staff ou cole o ID')
                  .setPlaceholder('@MembroStaff ou ID do Discord')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
                  .setMaxLength(100)
              )
            );

          return interaction.showModal(modal);
        }

        // NOTIFICAR PLAYER
if (id === 'ticket_notificar_player') {
  const configTicket = await pegarConfigDoTicket(interaction.guildId, interaction.channel);

  if (
    !configTicket?.staffRoleId ||
    !memberIsStaff(interaction.member, configTicket)
  ) {
    return interaction.reply({
      content: '❌ Apenas a staff pode notificar o jogador.',
      ...privateReply
    });
  }

  const playerId = getTicketCreatorId(interaction.channel);

  if (!playerId) {
    return interaction.reply({
      content: '❌ Não consegui identificar quem abriu este ticket.',
      ...privateReply
    });
  }

  await interaction.reply({
    content: `🔔 <@${playerId}>, a staff está te chamando no seu ticket!`,
    allowedMentions: {
      users: [playerId]
    }
  });

  return;
                                     }

        // TRANCAR OU DESTRANCAR O TICKET
        if (id === 'ticket_trancar') {
          const configTicket = await pegarConfigDoTicket(interaction.guildId, interaction.channel);
          const membro = interaction.member;
          const ehStaff = configTicket?.staffRoleId && memberIsStaff(membro, configTicket);

          if (!ehStaff && !membro.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: '❌ Apenas a staff pode trancar ou destrancar este ticket.', ...privateReply });
          }

          const playerId = getTicketCreatorId(interaction.channel);
          if (!playerId) {
            return interaction.reply({ content: '❌ Não consegui identificar quem abriu este ticket.', ...privateReply });
          }

          const overwriteAtual = interaction.channel.permissionOverwrites.cache.get(playerId);
          const estaTrancado = overwriteAtual?.deny?.has(PermissionFlagsBits.SendMessages) === true;

          await interaction.channel.permissionOverwrites.edit(playerId, {
            ViewChannel: true,
            SendMessages: estaTrancado,
            ReadMessageHistory: true,
            AttachFiles: estaTrancado
          });

          await interaction.reply({
            content: estaTrancado
              ? '🔓 O ticket foi destrancado. O jogador já pode enviar mensagens novamente.'
              : '🔐 O ticket foi trancado. O jogador ainda pode ver o histórico, mas não enviar mensagens.'
          });

          if (configTicket?.logChannelId) {
            const logs = await interaction.guild.channels.fetch(configTicket?.logChannelId).catch(() => null);
            if (logs?.isTextBased()) {
              await logs.send(`🔐 ${interaction.user} ${estaTrancado ? 'destrancou' : 'trancou'} o ticket ${interaction.channel}.`).catch(console.error);
            }
          }
          return;
        }

        // PEDIR CONFIRMAÇÃO ANTES DE FECHAR
        if (id === 'ticket_fechar') {
          if (!(await podeFecharTicket(interaction.member, interaction.channel))) {
            return interaction.reply({
              content: MSG_SEM_PERMISSAO_FECHAR,
              ...privateReply
            });
          }

          return interaction.reply({
            content: '❓ O ticket foi resolvido?',
            components: [criarBotoesFechamento()],
            ...privateReply
          });
        }

        if (id === 'ticket_fechar_cancelar') {
          return interaction.update({
            content: '↩️ Fechamento cancelado.',
            embeds: [],
            components: []
          });
        }

        
        // CONFIRMAR FECHAMENTO DO TICKET
        if (id === 'ticket_fechar_confirmar') {
          const configTicket = await pegarConfigDoTicket(interaction.guildId, interaction.channel);

          if (!(await podeFecharTicket(interaction.member, interaction.channel))) {
            return interaction.reply({
              content: MSG_SEM_PERMISSAO_FECHAR,
              ...privateReply
            });
          }

          await interaction.update({
            content: '🔒 Ticket encerrado. Estou salvando o histórico antes de remover o canal.',
            embeds: [],
            components: []
          });

          const canalTicket = interaction.channel;
          const criadoEm = canalTicket.createdTimestamp || Date.now();
          const encerradoEm = Date.now();
          const duracaoMs = Math.max(0, encerradoEm - criadoEm);
          const totalMinutos = Math.floor(duracaoMs / 60000);
          const horas = Math.floor(totalMinutos / 60);
          const minutos = totalMinutos % 60;
          const duracaoTexto = horas > 0
            ? `${horas} hora${horas === 1 ? '' : 's'} e ${minutos} min`
            : `${minutos} min`;

          let transcript = null;
          try {
            transcript = await gerarTranscript(canalTicket, interaction.guild);
          } catch (erroTranscript) {
            console.error('Erro ao gerar transcript do ticket:', erroTranscript);
          }

          if (configTicket?.logChannelId) {
            const logs = await interaction.guild.channels
              .fetch(configTicket?.logChannelId)
              .catch(() => null);

            if (logs?.isTextBased()) {
              const playerId = getTicketCreatorId(canalTicket);
              const responsavelId = await pegarAssumidoPor(canalTicket.id).catch(() => null);
              const arquivos = transcript ? [transcript] : [];
              const membroPlayer = playerId
                ? await interaction.guild.members.fetch(playerId).catch(() => null)
                : null;
              const membroStaff = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
              const nomePlayer = membroPlayer?.displayName || membroPlayer?.user?.username || 'usuário não identificado';
              const nomeStaff = membroStaff?.displayName || membroStaff?.user?.username || interaction.user.username;
              const criadoTimestamp = Math.floor(criadoEm / 1000);
              const encerradoTimestamp = Math.floor(encerradoEm / 1000);

              const embedLog = new EmbedBuilder()
                .setColor('#5865F2')
                .setDescription(
                  `🔒 O ticket de **${nomePlayer}** foi fechado por **${nomeStaff}**

` +
                  `> Aqui estão algumas informações importantes sobre o atendimento:

` +
                  `- **Duração:** ${duracaoTexto}
` +
                  `- **Criado** <t:${criadoTimestamp}:R>: <t:${criadoTimestamp}:s>
` +
                  `- **Encerrado** <t:${encerradoTimestamp}:R>: <t:${encerradoTimestamp}:s>`
                )
                .setFooter({ text: `Canal: #${canalTicket.name}` })
                .setTimestamp();

              if (transcript) {
                embedLog.addFields({
                  name: 'Histórico do suporte',
                  value: '📎 O arquivo HTML está anexado nesta mensagem.'
                });
              } else {
                embedLog.addFields({
                  name: 'Histórico do suporte',
                  value: '⚠️ Não foi possível gerar o arquivo HTML.'
                });
              }

              await logs.send({
                embeds: [embedLog],
                files: arquivos,
                allowedMentions: { users: [...new Set([playerId, responsavelId, interaction.user.id].filter(Boolean))] }
              }).catch(erroLog => {
                console.error('Erro ao enviar log do ticket:', erroLog);
              });
            }
          }

          await removerTicket(canalTicket.id);

          setTimeout(() => {
            canalTicket.delete(`Ticket encerrado por ${interaction.user.tag}`).catch(console.error);
          }, 3000);

          return;
        }
      }

      // ENVIO DOS MODAIS
if (interaction.isModalSubmit()) {
  const [id, tipoParam] = interaction.customId.split(':');

// ADICIONAR STAFF INFORMADO NO MODAL
if (id === 'ticket_add_staff_modal') {
  const configTicket = await pegarConfigDoTicket(interaction.guildId, interaction.channel);
  const responsavelId = await pegarAssumidoPor(interaction.channelId);

  if (!configTicket?.staffRoleId ||
      !memberIsStaff(interaction.member, configTicket)) {
    return interaction.reply({
      content: '❌ Apenas a staff pode adicionar membros ao ticket.',
      ...privateReply
    });
  }

  if (responsavelId !== interaction.user.id) {
    return interaction.reply({
      content: '❌ Somente quem assumiu este ticket pode adicionar outro staff.',
      ...privateReply
    });
  }

  const entrada = interaction.fields.getTextInputValue('staff_mencao').trim();
  const match = entrada.match(/^(?:<@!?(\d{17,20})>|(\d{17,20}))$/);
  const staffId = match?.[1] || match?.[2];

  if (!staffId) {
    return interaction.reply({
      content: '❌ Mencione o membro usando @ ou cole o ID numérico do Discord.',
      ...privateReply
    });
  }

  const membroStaff = await interaction.guild.members.fetch(staffId).catch(() => null);

  if (!membroStaff || !memberIsStaff(membroStaff, configTicket)) {
    return interaction.reply({
      content: '❌ Esse membro não foi encontrado ou não possui o cargo staff configurado.',
      ...privateReply
    });
  }

  if (staffId === getTicketCreatorId(interaction.channel)) {
    return interaction.reply({
      content: '❌ O jogador que abriu o ticket não pode ser adicionado como staff.',
      ...privateReply
    });
  }

  await interaction.deferReply();

  await interaction.channel.permissionOverwrites.edit(staffId, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    AttachFiles: true
  });

  await interaction.editReply({
    content: `✅ ${membroStaff} foi adicionado ao ticket para ajudar.`,
    allowedMentions: { users: [staffId] }
  });

  const configAtual = await pegarConfigDoTicket(interaction.guildId, interaction.channel);
  if (configAtual?.logChannelId) {
    const logs = await interaction.guild.channels.fetch(configAtual?.logChannelId).catch(() => null);
    if (logs?.isTextBased()) {
      await logs.send(`👥 ${interaction.user} adicionou ${membroStaff} ao ticket ${interaction.channel}.`);
    }
  }

  return;
}

// CRIAR UM NOVO TIPO DE TICKET
if (id === 'ticket_novo_modal') {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      content: '❌ Apenas administradores podem usar este painel.',
      ...privateReply
    });
  }

  const nome = valorTexto(
    interaction.fields.getTextInputValue('valor')
  ).slice(0, 80);

  if (!nome) {
    return interaction.reply({
      content: '❌ Digite um nome para o ticket.',
      ...privateReply
    });
  }

  const novo = await criarTipoTicket(interaction.guildId, nome);

  if (!novo) {
    return interaction.reply({
      content: `❌ Limite de ${LIMITE_TIPOS_TICKET} tickets atingido.`,
      ...privateReply
    });
  }

  const painelNovo = painelTicket(novo);

  return interaction.isFromMessage()
    ? interaction.update(painelNovo)
    : interaction.reply({ ...painelNovo, ...privateReply });
}

// SALVAR CONFIGURAÇÕES DO PAINEL PÚBLICO
if (id.startsWith('tpub_config_')) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      content: '❌ Apenas administradores podem usar este painel.',
      ...privateReply
    });
  }

  const campoPainel = id.slice('tpub_config_'.length);

  if (
    !['channelId', 'titulo', 'descricao', 'banner', 'cor', 'placeholder'].includes(campoPainel)
  ) {
    return interaction.reply({
      content: '❌ Configuração desconhecida.',
      ...privateReply
    });
  }

  await salvarCampoPainelPublico(
    interaction.guildId,
    campoPainel,
    valorTexto(interaction.fields.getTextInputValue('valor')) || null
  );

  await atualizarPainelPublico(interaction.guild);

  return interaction.reply({
    content: '✅ Configuração salva.',
    ...privateReply
  });
}

// SALVAR CONFIGURAÇÕES DO PAINEL DE TICKETS
if (id.startsWith('ticket_config_')) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      content: '❌ Apenas administradores podem usar este painel.',
      ...privateReply
    });
  }

  const valor = valorTexto(
    interaction.fields.getTextInputValue('valor')
  );

  const campo = id.slice('ticket_config_'.length);

          const camposPermitidos = [
            'panelChannelId',
            'categoryId',
            'staffRoleId',
            'logChannelId',
            'titulo',
            'descricao',
            'banner',
            'cor',
            'botao',
            'emoji'
          ];

          if (!camposPermitidos.includes(campo)) {
            return interaction.reply({
              content: '❌ Configuração desconhecida.',
              ...privateReply
            });
          }

          const salvo = await salvarCampoTicket(
            interaction.guildId,
            tipoParam || 'principal',
            campo,
            valor || null
          );

          if (!salvo) {
            return interaction.reply({
              content: '❌ Esse ticket não existe mais.',
              ...privateReply
            });
          }

          await atualizarPainelPublico(interaction.guild);

          return interaction.reply({
            content: '✅ Configuração salva.',
            ...privateReply
          });
        }

        // CRIAR TICKET DEPOIS DO FORMULÁRIO
        if (id === 'ticket_criar_modal') {
          // Criar o canal demora; responde logo para a interação não expirar.
          await interaction.deferReply({ ...privateReply });

          const nick = interaction.fields.getTextInputValue('nick');
          const problema = interaction.fields.getTextInputValue('problema');
          const descricao = interaction.fields.getTextInputValue('descricao');

          const configTicket = await pegarTipoTicket(
            interaction.guildId,
            tipoParam
          );

          if (!configTicket?.staffRoleId) {
            return interaction.editReply({
              content: '❌ O sistema de tickets ainda não está configurado.'
            });
          }

          // Impedir que a mesma pessoa abra vários tickets do mesmo tipo.
          const ticketAberto = interaction.guild.channels.cache.find(c =>
            c.type === ChannelType.GuildText &&
            getTicketCreatorId(c) === interaction.user.id &&
            (getTicketTipoId(c) || 'principal') === configTicket.tipoId
          );
          if (ticketAberto) {
            return interaction.editReply({
              content: `❌ Você já tem um ticket aberto: ${ticketAberto}`
            });
          }

          // Validar todos os cargos de staff configurados (separados por espaço ou vírgula).
          const staffIds = staffRoleIds(configTicket);
          const cargosStaff = await Promise.all(
            staffIds.map(id => interaction.guild.roles.fetch(id).catch(() => null))
          );
          const cargosValidos = cargosStaff.filter(Boolean);

          if (!staffIds.length || !cargosValidos.length) {
            return interaction.editReply({
              content: '❌ Nenhum cargo de staff válido foi encontrado. Configure os IDs dos cargos separados por vírgula.'
            });
          }

          const categoria = configTicket.categoryId
            ? await interaction.guild.channels
                .fetch(configTicket.categoryId)
                .catch(() => null)
            : null;

          const canal = await interaction.guild.channels.create({
            name: `${slugTicket(configTicket.nome)}-${interaction.user.username}`
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '')
              .slice(0, 90),
            type: ChannelType.GuildText,
            parent: categoria?.type === ChannelType.GuildCategory
              ? categoria.id
              : undefined,
            topic: `ticket:${interaction.user.id}:${configTicket.tipoId}`,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
              },
              {
                id: interaction.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                  PermissionFlagsBits.AttachFiles
                ]
              },
              ...cargosValidos.map(cargo => ({
                id: cargo.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory
                ]
              }))
            ]
          });

          const embed = new EmbedBuilder()
  .setColor(configTicket.cor || '#57F287')
  .setTitle(configTicket.titulo || '🎫 Novo ticket')
  .setDescription(
    configTicket.descricao ||
    'Olá! Seu ticket foi aberto com sucesso.\n' +
    'Aguarde um momento até que um ADM leia sua solicitação e faça o atendimento.'
  )
  .addFields(
    { name: 'Usuário', value: `${interaction.user}` },
    { name: 'Nick no jogo', value: nick },
    { name: 'Problema', value: problema },
    { name: 'Descrição', value: descricao }
  )
  .setTimestamp();

if (configTicket.banner) {
  embed.setImage(configTicket.banner);
}

          const botoes1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_assumir').setLabel('Assumir').setEmoji('🛡️').setStyle(ButtonStyle.Success)
          );

          await canal.send({
            content:
              `👋 Olá, ${interaction.user}!\n\n` +
              `✅ Seu ticket foi aberto com sucesso!\n` +
              `⏳ Aguarde um momento até que um ADM leia sua solicitação e faça o atendimento.\n\n` +
              `📢 **Staff notificada:** ${staffIds.map(id => `<@&${id}>`).join(' ')}`,
            embeds: [embed],
            components: [botoes1],
            allowedMentions: {
              users: [interaction.user.id],
              roles: staffIds
            }
          });

          if (configTicket?.logChannelId) {
            const logs = await interaction.guild.channels
              .fetch(configTicket?.logChannelId)
              .catch(() => null);

            if (logs?.isTextBased()) {
              await logs.send(
                `🆕 Ticket ${canal} criado por ${interaction.user}.`
              );
            }
          }

          return interaction.editReply({
            content: `✅ Seu ticket foi criado: ${canal}`
          });
        }

        // MODAIS DO REGISTRO
        if (
          id === 'registro_modal' ||
          id === 'registro_atualizar_modal'
        ) {
          const texto = valorTexto(
  interaction.fields.getTextInputValue('valor')
);

          await criarRegistro(
            interaction.guildId,
            interaction.user.id,
            texto
          );

          return interaction.reply({
            content: '✅ Registro salvo.',
            ...privateReply
          });
        }

        // OUTROS MODAIS DE CONFIGURAÇÃO
        if (id.startsWith('registro_config_')) {
          const campo = id.slice('registro_config_'.length);

          await salvarConfig(interaction.guildId, campo, valor);

          return interaction.reply({
            content: '✅ Configuração de registro salva.',
            ...privateReply
          });
        }

        if (id.startsWith('staff_config_')) {
          const campo = id.slice('staff_config_'.length);

          await salvarConfigStaff(interaction.guildId, campo, valor);

          return interaction.reply({
            content: '✅ Configuração de staff salva.',
            ...privateReply
          });
        }

        if (id.startsWith('geral_config_')) {
          const campo = id.slice('geral_config_'.length);

          await serverConfigCollection.updateOne(
            { guildId: interaction.guildId },
            { $set: { [campo]: valor, guildId: interaction.guildId } },
            { upsert: true }
          );

          return interaction.reply({
            content: '✅ Configuração geral salva.',
            ...privateReply
          });
        }

        // MODAIS DE CONFIGURAÇÃO XP
        if (id === 'xp_cargo_modal') {
          await salvarConfigXP(interaction.guildId, {
            cargos: valor
          });

          return interaction.reply({
            content: '✅ Configuração de cargos XP salva.',
            ...privateReply
          });
        }

        if (id === 'xp_canal_modal') {
          await salvarConfigXP(interaction.guildId, {
            canais: valor
          });

          return interaction.reply({
            content: '✅ Configuração de canais XP salva.',
            ...privateReply
          });
        }

        if (id === 'xp_mensagem_modal') {
          await salvarConfigXP(interaction.guildId, {
            mensagem: valor
          });

          return interaction.reply({
            content: '✅ Mensagem de XP salva.',
            ...privateReply
          });
        }

        if (id === 'xp_cooldown_modal') {
          const segundos = Number(valor);

          if (!Number.isFinite(segundos) || segundos < 0) {
            return interaction.reply({
              content: '❌ Digite um número válido de segundos.',
              ...privateReply
            });
          }

          await salvarConfigXP(interaction.guildId, {
            cooldown: segundos
          });

          return interaction.reply({
            content: '✅ Cooldown XP salvo.',
            ...privateReply
          });
        }
      }
    } catch (error) {
      console.error('Erro no InteractionCreate:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar essa interação.',
          ...privateReply
        }).catch(() => {});
      }
    }
  }
};
            
            
