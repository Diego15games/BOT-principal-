import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { addXP } from '../../systems/xp.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('Adicionar XP a um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade de XP').setMinValue(1).setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const quantidade = interaction.options.getInteger('quantidade');
    try {
      await addXP(user.id, quantidade);
      return interaction.reply({ content: `✅ Adicionados ${quantidade} XP para ${user}.` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível adicionar XP. Confira a configuração do sistema.', flags: MessageFlags.Ephemeral });
    }
  }
};