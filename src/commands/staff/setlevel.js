import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { setLevel } from '../../systems/xp.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Definir nível de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption(o => o.setName('nivel').setDescription('Novo nível').setMinValue(0).setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const nivel = interaction.options.getInteger('nivel');
    try {
      await setLevel(user.id, nivel);
      return interaction.reply({ content: `✅ Nível de ${user} definido para ${nivel}.` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível alterar o nível.', flags: MessageFlags.Ephemeral });
    }
  }
};