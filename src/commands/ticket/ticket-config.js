import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { configurarTickets } from '../../systems/tickets.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-config')
    .setDescription('Configurar o sistema de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o => o.setName('canal_painel').setDescription('Canal do painel').setRequired(true))
    .addRoleOption(o => o.setName('cargo_staff').setDescription('Cargo que atende os tickets').setRequired(true))
    .addChannelOption(o => o.setName('canal_logs').setDescription('Canal de logs').setRequired(false)),
  async execute(interaction) {
    try {
      await configurarTickets({
        guildId: interaction.guildId,
        panelChannelId: interaction.options.getChannel('canal_painel').id,
        staffRoleId: interaction.options.getRole('cargo_staff').id,
        logChannelId: interaction.options.getChannel('canal_logs')?.id || null
      });
      return interaction.reply({ content: '✅ Configuração de tickets salva.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível salvar a configuração.', flags: MessageFlags.Ephemeral });
    }
  }
};