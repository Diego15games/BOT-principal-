import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { removeMoney } from '../../systems/economia.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deletgrana')
    .setDescription('Remover dinheiro de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption(o => o.setName('valor').setDescription('Valor a remover').setMinValue(1).setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const valor = interaction.options.getInteger('valor');
    try {
      await removeMoney(user.id, valor);
      return interaction.reply({ content: `💸 Foram removidos R$ ${valor.toLocaleString('pt-BR')} de ${user}.` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível remover o dinheiro.', flags: MessageFlags.Ephemeral });
    }
  }
};