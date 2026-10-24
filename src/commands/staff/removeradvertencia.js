import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { removerAdvertencia } from '../../systems/staff.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removeradvertencia')
    .setDescription('Remover a última advertência de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    try {
      const removida = await removerAdvertencia(user.id);
      if (!removida) return interaction.reply({ content: 'Esse usuário não tem advertências registradas.', flags: MessageFlags.Ephemeral });
      return interaction.reply({ content: `✅ Uma advertência de ${user} foi removida.` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível remover a advertência.', flags: MessageFlags.Ephemeral });
    }
  }
};