import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { setMoney } from '../../systems/economia.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setgrana')
    .setDescription('Definir saldo de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption(o => o.setName('valor').setDescription('Novo saldo').setMinValue(0).setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const valor = interaction.options.getInteger('valor');
    try {
      await setMoney(user.id, valor);
      return interaction.reply({ content: `✅ Saldo de ${user} definido para R$ ${valor.toLocaleString('pt-BR')}.` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível alterar o saldo.', flags: MessageFlags.Ephemeral });
    }
  }
};