import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { advertirUsuario } from '../../systems/staff.js';

export default {
  data: new SlashCommandBuilder()
    .setName('advertir')
    .setDescription('Advertir um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo da advertência').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo');
    if (user.id === interaction.user.id || user.bot) {
      return interaction.reply({ content: '❌ Não é possível advertir esse usuário.', flags: MessageFlags.Ephemeral });
    }
    try {
      await advertirUsuario(user.id, motivo, interaction.user.id);
      return interaction.reply({ content: `⚠️ ${user} recebeu uma advertência.\nMotivo: ${motivo}` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Falha ao registrar a advertência.', flags: MessageFlags.Ephemeral });
    }
  }
};