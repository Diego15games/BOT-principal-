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
import { painelRegistro } from '../panels/painelRegistro.js';
import { painelStaff } from '../panels/painelStaff.js';
import { painelGeral } from '../panels/painelGeral.js';

import {
  pegarConfig,
  criarRegistro,
  salvarConfig
} from '../systems/registro.js';

import {
  pegarConfigTickets,
  configurarTickets,
  assumirTicket,
  pegarAssumidoPor,
  removerTicket,
  getTicketCreatorId
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

      // BOTÕES
      if (interaction.isButton()) {
        const id = interaction.customId;

        const botoesPublicos = [
          'ticket_abrir',
          'ticket_assumir',
          'ticket_chamar_staff',
          'ticket_fechar',
          'ticket_fechar_confirmar',
          'ticket_fechar_cancelar'
        ];

        const botoesPainel = [
          'painel_principal',
          'painel_ticket',
          'painel_ticket2',
          'ticket_pagina2',
          'ticket_pagina3',
          'painel_registro',
          'painel_staff',
          'painel_geral',
          'painel_xp',
          'ticket_canal',
          'ticket_categoria',
          'ticket_staff',
          'ticket_logs',
          'ticket_titulo',
          'ticket_descricao',
          'ticket_banner',
          'ticket_cor',
          'ticket_botao',
          'ticket_emoji',
          'ticket_preview',
          'ticket_enviar'
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
          painel_ticket: painelTicket,
          painel_ticket2: painelTicket2,
          ticket_pagina2: painelTicket2,
          ticket_pagina3: painelTicket3,
          painel_registro: painelRegistro,
          painel_staff: painelStaff,
          painel_geral: painelGeral
        };

        if (paineis[id]) {
          return interaction.update(paineis[id]());
        }

        
        // CONFIGURAÇÕES DOS TICKETS
        const config = await pegarConfigTickets(interaction.guildId);

        const camposTicket = {
          ticket_canal: {
            campo: 'panelChannelId',
            titulo: 'Configurar canal do painel',
            label: 'ID do canal de texto'
          },
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
              `ticket_config_${item.campo}`,
              item.titulo,
              'valor',
              item.label,
              item.style || TextInputStyle.Short,
              config?.[item.campo] || ''
            )
          );
        }

        // PRÉ-VISUALIZAÇÃO DO PAINEL PÚBLICO
        if (id === 'ticket_preview') {
          const embed = new EmbedBuilder()
            .setColor(config?.cor || '#57F287')
            .setTitle(config?.titulo || '🎫 Suporte')
            .setDescription(
              config?.descricao ||
              'Clique no botão abaixo para abrir um ticket.'
            );

          if (config?.banner) {
            embed.setImage(config.banner);
          }

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_abrir')
              .setLabel(config?.botao || 'Abrir Ticket')
              .setEmoji(config?.emoji || '🎫')
              .setStyle(ButtonStyle.Success)
          );

          return interaction.reply({
            embeds: [embed],
            components: [row],
            ...privateReply
          });
        }

        // ENVIAR O PAINEL PÚBLICO PARA O CANAL CONFIGURADO
        if (id === 'ticket_enviar') {
          if (!config?.panelChannelId || !config?.staffRoleId) {
            return interaction.reply({
              content:
                '❌ Configure primeiro o canal do painel e o cargo staff na página 1.',
              ...privateReply
            });
          }

          const canal = await interaction.guild.channels
            .fetch(config.panelChannelId)
            .catch(() => null);

          if (!canal || canal.type !== ChannelType.GuildText) {
            return interaction.reply({
              content:
                '❌ O canal configurado não existe ou não é um canal de texto.',
              ...privateReply
            });
          }

          const embed = new EmbedBuilder()
            .setColor(config.cor || '#57F287')
            .setTitle(config.titulo || '🎫 Suporte')
            .setDescription(
              config.descricao ||
              'Clique no botão abaixo para abrir um ticket.'
            );

          if (config.banner) {
            embed.setImage(config.banner);
          }

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_abrir')
              .setLabel(config.botao || 'Abrir Ticket')
              .setEmoji(config.emoji || '🎫')
              .setStyle(ButtonStyle.Success)
          );

          await canal.send({
            embeds: [embed],
            components: [row]
          });

          return interaction.reply({
            content: `✅ Painel enviado para ${canal}.`,
            ...privateReply
          });
        }

        // ABRIR TICKET: MOSTRAR FORMULÁRIO
        if (id === 'ticket_abrir') {
          return interaction.showModal(
            new ModalBuilder()
              .setCustomId('ticket_criar_modal')
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
                    .setLabel('Tipo de problema')
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
              )
          );
        }

        // ASSUMIR TICKET
        if (id === 'ticket_assumir') {
          const configTicket = await pegarConfigTickets(
            interaction.guildId
          );

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

          const playerId = getTicketCreatorId(interaction.channel);

          // Depois de assumir, o ticket fica restrito ao jogador e ao responsável.
          for (const roleId of staffRoleIds(configTicket)) {
            await interaction.channel.permissionOverwrites.edit(roleId, {
              ViewChannel: false,
              SendMessages: false,
              ReadMessageHistory: false
            });
          }

          await interaction.channel.permissionOverwrites.edit(
            interaction.user.id,
            {
              ViewChannel: true,
              SendMessages: true,
              ReadMessageHistory: true,
              AttachFiles: true
            }
          );

          if (playerId) {
            await interaction.channel.permissionOverwrites.edit(
              playerId,
              {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true
              }
            );
          }

          // Ativar o botão Add Staff somente depois que o ticket for assumido.
          const componentesAtualizados = interaction.message.components.map(linha =>
            ActionRowBuilder.from(linha).setComponents(
              ...linha.components.map(componente => {
                const botao = ButtonBuilder.from(componente);
                if (botao.data.custom_id === 'ticket_add_staff') {
                  botao.setDisabled(false);
                }
                return botao;
              })
            )
          );

          await interaction.message.edit({
            components: componentesAtualizados
          });

          await interaction.reply({
            content: `✅ Ticket assumido por ${interaction.user}. Agora só você, o jogador e os staffs adicionados conseguem ver este canal.`
          });

          if (configTicket.logChannelId) {
            const logs = await interaction.guild.channels
              .fetch(configTicket.logChannelId)
              .catch(() => null);

            if (logs?.isTextBased()) {
              await logs.send(
                `📌 ${interaction.user} assumiu o ticket ${interaction.channel}.`
              );
            }
          }

          return;
        }

        // ADICIONAR OUTRO MEMBRO DA STAFF AO TICKET
        if (id === 'ticket_add_staff') {
          const configTicket = await pegarConfigTickets(interaction.guildId);
          const responsavelId = await pegarAssumidoPor(interaction.channelId);

          if (!configTicket?.staffRoleId ||
              !interaction.member.roles.cache.has(configTicket.staffRoleId)) {
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
  const configTicket = await pegarConfigTickets(
    interaction.guildId
  );

  if (
    !configTicket?.staffRoleId ||
    !interaction.member.roles.cache.has(configTicket.staffRoleId)
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

        // PEDIR CONFIRMAÇÃO ANTES DE FECHAR
        if (id === 'ticket_fechar') {
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
          const configTicket = await pegarConfigTickets(
            interaction.guildId
          );

          const membro = interaction.member;
          const ehStaff =
            configTicket?.staffRoleId &&
            memberIsStaff(membro, configTicket);

          if (!ehStaff && !membro.permissions.has(
            PermissionFlagsBits.ManageChannels
          )) {
            return interaction.reply({
              content: '❌ Apenas o staff pode fechar este ticket.',
              ...privateReply
            });
          }

          await interaction.update({
            content: '🔒 Ticket encerrado. O canal será removido em alguns segundos.',
            embeds: [],
            components: []
          });

          if (configTicket?.logChannelId) {
            const logs = await interaction.guild.channels
              .fetch(configTicket.logChannelId)
              .catch(() => null);

            if (logs?.isTextBased()) {
              await logs.send(
                `🔒 Ticket ${interaction.channel.name} encerrado por ${interaction.user}.`
              );
            }
          }

          await removerTicket(interaction.channelId);

          setTimeout(() => {
            interaction.channel.delete(
              `Ticket encerrado por ${interaction.user.tag}`
            ).catch(console.error);
          }, 3000);

          return;
        }
      }

      // ENVIO DOS MODAIS
if (interaction.isModalSubmit()) {
  const id = interaction.customId;

// ADICIONAR STAFF INFORMADO NO MODAL
if (id === 'ticket_add_staff_modal') {
  const configTicket = await pegarConfigTickets(interaction.guildId);
  const responsavelId = await pegarAssumidoPor(interaction.channelId);

  if (!configTicket?.staffRoleId ||
      !interaction.member.roles.cache.has(configTicket.staffRoleId)) {
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

  await interaction.channel.permissionOverwrites.edit(staffId, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    AttachFiles: true
  });

  await interaction.reply({
    content: `✅ ${membroStaff} foi adicionado ao ticket para ajudar.`,
    allowedMentions: { users: [staffId] }
  });

  const configAtual = await pegarConfigTickets(interaction.guildId);
  if (configAtual?.logChannelId) {
    const logs = await interaction.guild.channels.fetch(configAtual.logChannelId).catch(() => null);
    if (logs?.isTextBased()) {
      await logs.send(`👥 ${interaction.user} adicionou ${membroStaff} ao ticket ${interaction.channel}.`);
    }
  }

  return;
}

// SALVAR CONFIGURAÇÕES DO PAINEL DE TICKETS
if (id.startsWith('ticket_config_')) {
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

          const dados = {
            guildId: interaction.guildId,
            [campo]: valor || null
          };

          await configurarTickets(dados);

          return interaction.reply({
            content: '✅ Configuração salva.',
            ...privateReply
          });
        }

        // CRIAR TICKET DEPOIS DO FORMULÁRIO
        if (id === 'ticket_criar_modal') {
          const nick = interaction.fields.getTextInputValue('nick');
          const problema = interaction.fields.getTextInputValue('problema');
          const descricao = interaction.fields.getTextInputValue('descricao');

          const configTicket = await pegarConfigTickets(
            interaction.guildId
          );

          if (!configTicket?.staffRoleId) {
            return interaction.reply({
              content: '❌ O sistema de tickets ainda não está configurado.',
              ...privateReply
            });
          }

          // Validar todos os cargos de staff configurados (separados por espaço ou vírgula).
          const staffIds = staffRoleIds(configTicket);
          const cargosStaff = await Promise.all(
            staffIds.map(id => interaction.guild.roles.fetch(id).catch(() => null))
          );
          const cargosValidos = cargosStaff.filter(Boolean);

          if (!staffIds.length || !cargosValidos.length) {
            return interaction.reply({
              content: '❌ Nenhum cargo de staff válido foi encontrado. Configure os IDs dos cargos separados por vírgula.',
              ...privateReply
            });
          }

          const categoria = configTicket.categoryId
            ? await interaction.guild.channels
                .fetch(configTicket.categoryId)
                .catch(() => null)
            : null;

          const canal = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '')
              .slice(0, 90),
            type: ChannelType.GuildText,
            parent: categoria?.type === ChannelType.GuildCategory
              ? categoria.id
              : undefined,
            topic: `ticket:${interaction.user.id}`,
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

          const botoes = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId('ticket_assumir')
    .setLabel('Assumir')
    .setEmoji('🛡️')
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId('ticket_add_staff')
    .setLabel('Add Staff')
    .setEmoji('👥')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true),

  new ButtonBuilder()
    .setCustomId('ticket_notificar_player')
    .setLabel('Notificar Player')
    .setEmoji('🔔')
    .setStyle(ButtonStyle.Secondary),

  new ButtonBuilder()
    .setCustomId('ticket_fechar')
    .setLabel('Fechar')
    .setEmoji('🔒')
    .setStyle(ButtonStyle.Danger)
);
await canal.send({
  content:
    `👋 Olá, ${interaction.user}!\n\n` +
    `✅ Seu ticket foi aberto com sucesso!\n` +
    `⏳ Aguarde um momento até que um ADM leia sua solicitação e faça o atendimento.\n\n` +
    `📢 **Staff notificada:** ${staffIds.map(id => `<@&${id}>`).join(' ')}`,

  embeds: [embed],
  components: [botoes],

  allowedMentions: {
    users: [interaction.user.id],
    roles: staffIds
  }
});

          if (configTicket.logChannelId) {
            const logs = await interaction.guild.channels
              .fetch(configTicket.logChannelId)
              .catch(() => null);

            if (logs?.isTextBased()) {
              await logs.send(
                `🆕 Ticket ${canal} criado por ${interaction.user}.`
              );
            }
          }

          return interaction.reply({
            content: `✅ Seu ticket foi criado: ${canal}`,
            ...privateReply
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
            
            
