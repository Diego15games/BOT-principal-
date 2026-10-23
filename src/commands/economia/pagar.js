import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags
} from 'discord.js';

import { transferMoney } from '../../systems/economia.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pagar')
    .setDescription('Transferir dinheiro para outro usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário que receberá')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('valor')
        .setDescription('Valor da transferência')
        .setMinValue(1)
        .setRequired(true)
    ),

  cooldown: 3,

  async execute(interaction) {
    const usuario = interaction.options.getUser('usuario');
    const valor = interaction.options.getInteger('valor');

    if (valor <= 0) {
      return interaction.reply({
        content: '❌ Valor inválido.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (usuario.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Você não pode pagar a si mesmo.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (usuario.bot) {
      return interaction.reply({
        content: '❌ Você não pode pagar um bot.',
        flags: MessageFlags.Ephemeral
      });
    }

    const sucesso = await transferMoney(
      interaction.user.id,
      usuario.id,
      valor
    );

    if (!sucesso) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setDescription('❌ Saldo insuficiente.')
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setDescription(
            `✅ Você transferiu **R$ ${valor.toLocaleString('pt-BR')}** para ${usuario}.`
          )
      ]
    });
  }
};
