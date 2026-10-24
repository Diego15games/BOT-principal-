import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { listarAdvertencias } from '../../systems/staff.js';

export default {
  data: new SlashCommandBuilder()
    .setName('advertencias')
    .setDescription('Consultar advertências de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const lista = await listarAdvertencias(user.id);
    const texto = !lista?.length
      ? 'Nenhuma advertência registrada.'
      : lista.map((a, i) => `**${i + 1}.** ${a.motivo || 'Sem motivo'} | por <@${a.moderadorId || a.staffId || interaction.user.id}>`).join('\n');
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`⚠️ Advertências de ${user.username}`).setDescription(texto)]
    });
  }
};