import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { adicionarPontosStaff } from '../../systems/staff.js';

export default {
  data: new SlashCommandBuilder()
    .setName('staff-pontos')
    .setDescription('Adicionar pontos a um membro da equipe')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('usuario').setDescription('Membro da equipe').setRequired(true))
    .addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade de pontos').setMinValue(1).setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const quantidade = interaction.options.getInteger('quantidade');
    const motivo = interaction.options.getString('motivo') || 'Não informado';
    try {
      await adicionarPontosStaff(user.id, quantidade, motivo, interaction.user.id);
      return interaction.reply({ content: `✅ ${quantidade} ponto(s) adicionado(s) para ${user}. Motivo: ${motivo}` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Não foi possível adicionar pontos.', flags: MessageFlags.Ephemeral });
    }
  }
};