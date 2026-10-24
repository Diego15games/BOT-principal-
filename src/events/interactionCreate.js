import {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder
} from 'discord.js';

import { executarBotoesXP } from '../panels/xpButtons.js';
import {
  pegarConfig,
  criarRegistro,
  pegarRegistro,
  salvarRegistroPendente,
  pegarRegistroPendente,
  removerRegistroPendente
} from '../systems/registro.js';
import { pegarConfigTickets } from '../systems/tickets.js';

export default {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          return interaction.reply({ content: '❌ Comando não encontrado.', flags: MessageFlags.Ephemeral });
        }

        const cooldownSeconds = Number(command.cooldown || 0);
        if (cooldownSeconds > 0) {
          const key = `${interaction.user.id}:${interaction.commandName}`;
          const expires = client.cooldowns.get(key);
          if (expires && expires > Date.now()) {
            return interaction.reply({
              content: `⏳ Aguarde ${Math.ceil((expires - Date.now()) / 1000)} segundo(s) antes de usar novamente.`,
              flags: MessageFlags.Ephemeral
            });
          }
          client.cooldowns.set(key, Date.now() + cooldownSeconds * 1000);
        }

        return await command.execute(interaction, client);
      }

      if (interaction.isButton()) {
        if (await executarBotoesXP(interaction)) return;

        if (interaction.customId === 'registro_criar' || interaction.customId === 'registro_atualizar') {
          const modal = new ModalBuilder()
            .setCustomId(interaction.customId === 'registro_criar' ? 'registro_modal' : 'registro_atualizar_modal')
            .setTitle(interaction.customId === 'registro_criar' ? 'Registro' : 'Atualizar registro');

          const nick = new TextInputBuilder()
            .setCustomId('nick')
            .setLabel('Seu nick no jogo')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50);

          const idade = new TextInputBuilder()
            .setCustomId('idade')
            .setLabel('Sua idade')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(3);

          modal.addComponents(
            new ActionRowBuilder().addComponents(nick),
            new ActionRowBuilder().addComponents(idade)
          );
          return await interaction.showModal(modal);
        }

        if (interaction.customId === 'painel_principal') {
          const { painelPrincipal } = await import('../panels/painelPrincipal.js');
          return await interaction.update(painelPrincipal());
        }

        if (interaction.customId.startsWith('ticket_')) {
          const config = await pegarConfigTickets(interaction.guildId);
          if (!config && interaction.customId === 'ticket_abrir') {
            return interaction.reply({ content: '❌ O sistema de tickets ainda não foi configurado.', flags: MessageFlags.Ephemeral });
          }
          return interaction.reply({
            content: '⚙️ Esta opção do painel ainda precisa ser conectada à configuração do sistema.',
            flags: MessageFlags.Ephemeral
          });
        }

        return;
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId === 'registro_modal' || interaction.customId === 'registro_atualizar_modal') {
          const nick = interaction.fields.getTextInputValue('nick').trim();
          const idadeTexto = interaction.fields.getTextInputValue('idade').trim();
          const idade = Number(idadeTexto);

          if (!nick || !Number.isInteger(idade) || idade < 1 || idade > 120) {
            return interaction.reply({ content: '❌ Informe um nick válido e uma idade entre 1 e 120.', flags: MessageFlags.Ephemeral });
          }

          await criarRegistro(interaction.user.id, { nick, idade, atualizadoEm: new Date() });
          const config = await pegarConfig();

          if (config?.cargoRegistrado) {
            const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
            if (member) {
              if (config.cargoRegistrado) await member.roles.add(config.cargoRegistrado).catch(() => {});
              if (config.cargoNaoRegistrado) await member.roles.remove(config.cargoNaoRegistrado).catch(() => {});
            }
          }

          return interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('✅ Registro salvo').setDescription(`Nick: **${nick}**\nIdade: **${idade}**`)],
            flags: MessageFlags.Ephemeral
          });
        }
      }
    } catch (error) {
      console.error('Erro em interactionCreate:', error);
      const payload = { content: '❌ Ocorreu um erro ao processar esta interação.', flags: MessageFlags.Ephemeral };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  }
};