import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { removeXP } from '../../systems/xp.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removexp')
    .setDescription('Remover XP de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade de XP').setMinValue(1).setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const quantidade = interaction.options.getInteger('quantidade');
    try {
      await removeXP(user.id, quantidade);
      return interaction.reply({ content: `✅ Removidos ${quantidade} XP de ${user}.` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível remover XP.', flags: MessageFlags.Ephemeral });
    }
  }
};