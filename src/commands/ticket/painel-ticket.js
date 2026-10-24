import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { painelTicket } from '../../panels/painelTicket.js';

export default {
  data: new SlashCommandBuilder()
    .setName('painel-ticket')
    .setDescription('Mostrar o painel de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    try {
      return await interaction.reply(painelTicket());
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível mostrar o painel.', flags: MessageFlags.Ephemeral });
    }
  }
};