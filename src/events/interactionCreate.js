import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { executarBotoesXP } from '../panels/xpButtons.js';
import { pegarConfig, criarRegistro, salvarConfig } from '../systems/registro.js';
import { pegarConfigTickets, configurarTickets, assumirTicket, pegarAssumidoPor, removerTicket, isTicketChannel } from '../systems/tickets.js';
import { pegarConfigXP, salvarConfigXP } from '../systems/xp.js';
import { salvarConfigStaff } from '../systems/staff.js';
import { db } from '../systems/database.js';

const serverConfigCollection = db.collection('serverConfig');
const privateReply = { flags: MessageFlags.Ephemeral };

function makeModal(id, title, field, label, style = TextInputStyle.Short, oldValue = '') {
  const modal = new ModalBuilder().setCustomId(id).setTitle(title);
  const input = new TextInputBuilder()
    .setCustomId(field)
    .setLabel(label)
    .setStyle(style)
    .setRequired(true)
    .setMaxLength(4000);

  if (oldValue) input.setValue(String(oldValue).slice(0, 4000));

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}

function parsePairs(raw) {
  const result = {};

  for (const line of raw.split(/[\n,;]+/).map(x => x.trim()).filter(Boolean)) {
    const i = line.indexOf('=');

    if (i < 1 || !line.slice(i + 1).trim()) {
      throw new Error('Use o formato chave=valor, uma configuração por linha.');
    }

    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    result[key] = value;
  }

  return result;
}

export default {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          return interaction.reply({
            content: '❌ Comando não encontrado.',
            ...privateReply
          });
        }

        const seconds = Number(command.cooldown || 0);

        if (seconds > 0) {
          const key =
            (interaction.guildId || 'dm') + ':' +
            interaction.user.id + ':' +
            interaction.commandName;

          const expiry = client.cooldowns.get(key);

          if (expiry && expiry > Date.now()) {
            return interaction.reply({
              content: '⏳ Aguarde ' +
                Math.ceil((expiry - Date.now()) / 1000) +
                ' segundo(s) antes de usar novamente.',
              ...privateReply
            });
          }

          client.cooldowns.set(key, Date.now() + seconds * 1000);
        }

        return await command.execute(interaction, client);
      }

      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === 'xp_config_menu'
      ) {
        if (
          !interaction.memberPermissions?.has(
            PermissionFlagsBits.ManageGuild
          )
        ) {
          return interaction.reply({
            content: '❌ Você precisa da permissão Gerenciar Servidor para configurar o XP.',
            ...privateReply
          });
        }

        const options = {
          xp_cargo: [
            'xp_cargo_modal', 'XP por Cargo',
            'cargos', 'ID_CARGO=XP por linha', 'xpCargo', 'map'
          ],
          xp_level: [
            'xp_level_modal', 'XP para Level',
            'xp', 'LEVEL=XP por linha', 'xpLevels', 'map'
          ],
          cooldown: [
            'xp_cooldown_modal', 'Cooldown XP',
            'cooldown', 'Tempo em segundos', 'cooldown', 'number'
          ],
          canais: [
            'xp_canais_modal', 'Canais sem XP',
            'canais', 'IDs separados por vírgula', 'canaisSemXP', 'list'
          ],
          cargos: [
            'xp_cargos_modal', 'Cargos por Level',
            'cargos', 'LEVEL=ID_CARGO por linha', 'cargos', 'map'
          ],
          canal_level: [
            'xp_canal_modal', 'Canal de Level Up',
            'canal', 'ID do canal', 'canalLevel', 'string'
          ],
          msg_level: [
            'xp_msg_level_modal', 'Mensagem de Level',
            'mensagem', 'Use {user} e {level}', 'mensagemLevel', 'string'
          ],
          msg_cargo: [
            'xp_msg_cargo_modal', 'Mensagem de Cargo',
            'mensagem', 'Use {user}, {level} e {cargo}', 'mensagemCargo', 'string'
          ]
        };

        const spec = options[interaction.values[0]];

        if (!spec) {
          return interaction.reply({
            content: 'Opção desconhecida.',
            ...privateReply
          });
        }

        const cfg = await pegarConfigXP() || {};
        delete cfg._id;

        const old = cfg[spec[4]];

        const oldText =
          old && typeof old === 'object'
            ? (
                Array.isArray(old)
                  ? old.join(',')
                  : Object.entries(old)
                      .map(([k, v]) => k + '=' + v)
                      .join('\n')
              )
            : old;

        const style =
          ['map', 'list'].includes(spec[5]) ||
          spec[2] === 'mensagem'
            ? TextInputStyle.Paragraph
            : TextInputStyle.Short;

        return interaction.showModal(
          makeModal(
            spec[0],
            spec[1],
            spec[2],
            spec[3],
            style,
            oldText || ''
          )
        );
      }
            if (interaction.isButton()) {
        if (
          interaction.customId.startsWith('xp_') &&
          !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
        ) {
          return interaction.reply({
            content: '❌ Você precisa da permissão Gerenciar Servidor para configurar o XP.',
            ...privateReply
          });
        }

        if (
          (
            (
              interaction.customId.startsWith('ticket_') &&
              ![
                'ticket_abrir',
                'ticket_assumir',
                'ticket_chamar_staff',
                'ticket_fechar',
                'ticket_fechar_confirmar',
                'ticket_fechar_cancelar'
              ].includes(interaction.customId)
            ) ||
            (
              interaction.customId.startsWith('registro_') &&
              !['registro_criar', 'registro_atualizar'].includes(interaction.customId)
            ) ||
            interaction.customId.startsWith('staff_') ||
            interaction.customId.startsWith('geral_')
          ) &&
          !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
        ) {
          return interaction.reply({
            content: '❌ Você precisa da permissão Gerenciar Servidor para alterar essa configuração.',
            ...privateReply
          });
        }

        if (await executarBotoesXP(interaction)) return;

        if (interaction.customId === 'registro_criar') {
          return interaction.showModal(
            makeModal(
              'registro_modal',
              'Criar Registro',
              'registro',
              'Digite as informações do registro',
              TextInputStyle.Paragraph
            )
          );
        }

        if (interaction.customId === 'registro_atualizar') {
          return interaction.showModal(
            makeModal(
              'registro_atualizar_modal',
              'Atualizar Registro',
              'registro',
              'Digite as informações atualizadas',
              TextInputStyle.Paragraph
            )
          );
        }

        if (interaction.customId === 'ticket_abrir') {
          const config = await pegarConfigTickets();

          if (!config) {
            return interaction.reply({
              content: '❌ O sistema de tickets ainda não foi configurado.',
              ...privateReply
            });
          }

          const modal = new ModalBuilder()
            .setCustomId('ticket_modal')
            .setTitle('Abrir Ticket');

          const nick = new TextInputBuilder()
            .setCustomId('nick')
            .setLabel('Seu nick')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

          const problema = new TextInputBuilder()
            .setCustomId('problema')
            .setLabel('Qual é o problema?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(200);

          const descricao = new TextInputBuilder()
            .setCustomId('descricao')
            .setLabel('Descreva o problema')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000);

          modal.addComponents(
            new ActionRowBuilder().addComponents(nick),
            new ActionRowBuilder().addComponents(problema),
            new ActionRowBuilder().addComponents(descricao)
          );

          return interaction.showModal(modal);
        }

        if (interaction.customId === 'ticket_assumir') {
          const config = await pegarConfigTickets();
          const membro = await interaction.guild.members
            .fetch(interaction.user.id)
            .catch(() => null);

          const staffAutorizada = Boolean(
            membro &&
            config?.staffRoleId &&
            membro.roles.cache.has(config.staffRoleId)
          );

          if (
            !staffAutorizada &&
            !interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
          ) {
            return interaction.reply({
              content: '❌ Apenas a equipe de suporte pode assumir este ticket.',
              ...privateReply
            });
          }

          const assumido = await pegarAssumidoPor(interaction.channel.id);

          if (assumido) {
            return interaction.reply({
              content: `❌ Este ticket já foi assumido por <@${assumido}>.`,
              ...privateReply
            });
          }

          await assumirTicket(interaction.channel.id, interaction.user.id);

          return interaction.reply({
            content: `✅ Ticket assumido por ${interaction.user}.`,
            allowedMentions: { users: [interaction.user.id] }
          });
        }

        if (interaction.customId === 'ticket_chamar_staff') {
          const config = await pegarConfigTickets();

          if (!config?.staffRoleId) {
            return interaction.reply({
              content: '❌ O cargo da equipe não está configurado.',
              ...privateReply
            });
          }

          return interaction.reply({
            content: `🔔 <@&${config.staffRoleId}>, a equipe foi chamada por ${interaction.user}.`,
            allowedMentions: {
              roles: [config.staffRoleId],
              users: [interaction.user.id]
            }
          });
        }

        if (interaction.customId === 'ticket_fechar') {
          const configFechamento = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle('Fechar ticket')
            .setDescription('Você tem certeza de que deseja fechar este ticket?');

          const botoesFechamento = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_fechar_confirmar')
              .setLabel('Sim, fechar')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('ticket_fechar_cancelar')
              .setLabel('Não, cancelar')
              .setStyle(ButtonStyle.Secondary)
          );

          return interaction.reply({
            embeds: [configFechamento],
            components: [botoesFechamento],
            ...privateReply
          });
        }

        if (
          interaction.customId === 'ticket_fechar_cancelar' ||
          interaction.customId === 'ticket_fechar_confirmar'
        ) {
          const config = await pegarConfigTickets();
          const membro = await interaction.guild.members
            .fetch(interaction.user.id)
            .catch(() => null);

          const staffAutorizada = Boolean(
            membro &&
            config?.staffRoleId &&
            membro.roles.cache.has(config.staffRoleId)
          );

          if (
            !staffAutorizada &&
            !interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
          ) {
            return interaction.reply({
              content: '❌ Apenas a equipe de suporte pode concluir essa ação.',
              ...privateReply
            });
          }

          if (interaction.customId === 'ticket_fechar_cancelar') {
            return interaction.update({
              content: '❎ Fechamento cancelado.',
              embeds: [],
              components: []
            });
          }

                  const canal = interaction.channel;

          await interaction.update({
            content: '🔒 Ticket fechado. O canal será removido em instantes.',
            embeds: [],
            components: []
          });

          await removerTicket(canal.id);

          if (config?.canalLogs) {
            const canalLogs = await interaction.guild.channels
              .fetch(config.canalLogs)
              .catch(() => null);

            if (canalLogs?.isTextBased()) {
              await canalLogs.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor(0xE74C3C)
                    .setTitle('Ticket fechado')
                    .addFields(
                      { name: 'Canal', value: canal.name, inline: true },
                      { name: 'Fechado por', value: `${interaction.user}`, inline: true }
                    )
                    .setTimestamp()
                ]
              }).catch(() => {});
            }
          }

          return setTimeout(() => {
            canal.delete('Ticket fechado').catch(() => {});
          }, 3000);
        }
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId === 'ticket_modal') {
          const config = await pegarConfigTickets();

          if (!config) {
            return interaction.reply({
              content: '❌ O sistema de tickets ainda não foi configurado.',
              ...privateReply
            });
          }

          const nick = interaction.fields.getTextInputValue('nick');
          const problema = interaction.fields.getTextInputValue('problema');
          const descricao = interaction.fields.getTextInputValue('descricao');

          const nomeCanal =
            `ticket-${interaction.user.username}`
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '')
              .slice(0, 90) || `ticket-${interaction.user.id}`;

          const permissoes = [
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
            }
          ];

          if (config.staffRoleId) {
            permissoes.push({
              id: config.staffRoleId,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageMessages
              ]
            });
          }

          const categoria = config.categoriaId
            ? await interaction.guild.channels
                .fetch(config.categoriaId)
                .catch(() => null)
            : null;

          const canal = await interaction.guild.channels.create({
            name: nomeCanal,
            type: ChannelType.GuildText,
            parent:
              categoria?.type === ChannelType.GuildCategory
                ? categoria.id
                : undefined,
            permissionOverwrites: permissoes
          });

          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`🎫 ${problema}`)
            .setDescription(
              `**Nick:** ${nick}\n` +
              `**Usuário:** ${interaction.user}\n\n` +
              `**Descrição:**\n${descricao}`
            )
            .setFooter({ text: `Ticket de ${interaction.user.username}` })
            .setTimestamp();

          const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_assumir')
              .setLabel('Assumir')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('ticket_chamar_staff')
              .setLabel('Chamar Staff')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('ticket_fechar')
              .setLabel('Fechar Ticket')
              .setStyle(ButtonStyle.Danger)
          );

          await canal.send({
            content: config.staffRoleId
              ? `<@&${config.staffRoleId}>`
              : '🎫 Novo ticket aberto.',
            embeds: [embed],
            components: [botoes],
            allowedMentions: {
              roles: config.staffRoleId ? [config.staffRoleId] : []
            }
          });

          return interaction.reply({
            content: `✅ Seu ticket foi criado: ${canal}`,
            ...privateReply
          });
        }

        if (interaction.customId === 'registro_modal') {
          const texto = interaction.fields.getTextInputValue('registro');

          await criarRegistro(
            interaction.guild.id,
            interaction.user.id,
            texto
          );

          return interaction.reply({
            content: '✅ Registro criado com sucesso.',
            ...privateReply
          });
        }

        if (interaction.customId === 'registro_atualizar_modal') {
          const texto = interaction.fields.getTextInputValue('registro');

          await criarRegistro(
            interaction.guild.id,
            interaction.user.id,
            texto
          );

          return interaction.reply({
            content: '✅ Registro atualizado com sucesso.',
            ...privateReply
          });
        }

        if (interaction.customId.startsWith('ticket_config_')) {
          const chave = interaction.customId.replace('ticket_config_', '');
          const permitidas = [
            'staffRoleId',
            'canalLogs',
            'categoriaId',
            'canalPainel'
          ];

          if (!permitidas.includes(chave)) {
            return interaction.reply({
              content: '❌ Configuração de ticket inválida.',
              ...privateReply
            });
          }

          const valor = interaction.fields.getTextInputValue('valor').trim();

          await configurarTickets({ [chave]: valor });

          return interaction.reply({
            content: '✅ Configuração de ticket salva.',
            ...privateReply
          });
        }

        if (interaction.customId.startsWith('registro_config_')) {
          const chave = interaction.customId.replace('registro_config_', '');
          const valor = interaction.fields.getTextInputValue('valor').trim();

          if (!chave) {
            return interaction.reply({
              content: '❌ Configuração de registro inválida.',
              ...privateReply
            });
          }

          await salvarConfig({ [chave]: valor });

          return interaction.reply({
            content: '✅ Configuração de registro salva.',
            ...privateReply
          });
        }

        if (interaction.customId.startsWith('staff_config_')) {
          const chave = interaction.customId.replace('staff_config_', '');
          const valor = interaction.fields.getTextInputValue('valor').trim();

          if (!chave) {
            return interaction.reply({
              content: '❌ Configuração de equipe inválida.',
              ...privateReply
            });
          }

          await salvarConfigStaff({ [chave]: valor });

          return interaction.reply({
            content: '✅ Configuração da equipe salva.',
            ...privateReply
          });
        }

        if (interaction.customId.startsWith('geral_config_')) {
          const chave = interaction.customId.replace('geral_config_', '');
          const valor = interaction.fields.getTextInputValue('valor').trim();

          if (!chave) {
            return interaction.reply({
              content: '❌ Configuração geral inválida.',
              ...privateReply
            });
          }

          await serverConfigCollection.updateOne(
            { guildId: interaction.guildId },
            {
              $set: {
                [chave]: valor,
                guildId: interaction.guildId
              }
            },
            { upsert: true }
          );

          return interaction.reply({
            content: '✅ Configuração geral salva.',
            ...privateReply
          });
        }
      }
    } catch (error) {
      console.error('Erro em interactionCreate:', error);

      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar essa interação.',
          ...privateReply
        }).catch(() => {});
      }
    }
  }
};
