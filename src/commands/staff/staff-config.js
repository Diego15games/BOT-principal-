import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { salvarConfigStaff } from '../../systems/staff.js';

export default {
  data: new SlashCommandBuilder()
    .setName('staff-config')
    .setDescription('Configurar o sistema da equipe')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(o => o.setName('cargo_staff').setDescription('Cargo da equipe').setRequired(true))
    .addChannelOption(o => o.setName('canal_logs').setDescription('Canal para logs da equipe').setRequired(false)),
  async execute(interaction) {
    try {
      await salvarConfigStaff({
        guildId: interaction.guildId,
        staffRoleId: interaction.options.getRole('cargo_staff').id,
        logChannelId: interaction.options.getChannel('canal_logs')?.id || null
      });
      return interaction.reply({ content: '✅ Configuração da equipe salva.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível salvar a configuração. Confira o sistema staff.', flags: MessageFlags.Ephemeral });
    }
  }
};