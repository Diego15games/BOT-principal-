import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { obterInfoStaff } from '../../systems/staff.js';

export default {
  data: new SlashCommandBuilder()
    .setName('staff-info')
    .setDescription('Consultar informações da equipe')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('usuario').setDescription('Membro da equipe').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    try {
      const info = await obterInfoStaff(user.id);
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`🛡️ Informações de ${user.username}`)
        .setDescription([
          `Pontos: **${info?.pontos ?? 0}**`,
          `Advertências: **${info?.advertencias ?? 0}**`,
          `XP: **${info?.xp ?? 0}**`
        ].join('\n'));
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível consultar as informações.', ephemeral: true });
    }
  }
};