import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { obterPerfilStaff } from '../../systems/staff.js';

export default {
  data: new SlashCommandBuilder()
    .setName('staff-perfil')
    .setDescription('Ver perfil de staff')
    .addUserOption(o => o.setName('usuario').setDescription('Membro da equipe').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    try {
      const perfil = await obterPerfilStaff(user.id);
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`🛡️ Perfil Staff: ${user.username}`).setDescription(
          `Pontos: **${perfil?.pontos ?? 0}**\nAdvertências: **${perfil?.advertencias ?? 0}**\nEntrou na equipe: **${perfil?.desde || 'Não registrado'}**`
        ).setThumbnail(user.displayAvatarURL())]
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível carregar o perfil.', ephemeral: true });
    }
  }
};