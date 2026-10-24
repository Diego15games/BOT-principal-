import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { fecharTicket } from '../../systems/fecharTicket.js';

export default {
  data: new SlashCommandBuilder()
    .setName('fechar-ticket')
    .setDescription('Fechar o ticket atual')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    try {
      await fecharTicket(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: '❌ Não foi possível fechar o ticket.', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: '❌ Não foi possível fechar o ticket.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};