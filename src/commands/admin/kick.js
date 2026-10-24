import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsar um membro')
    .addUserOption(option => option.setName('usuario').setDescription('Usuário para expulsar').setRequired(true))
    .addStringOption(option => option.setName('motivo').setDescription('Motivo da expulsão'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Não informado';
    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Você não pode expulsar a si mesmo.', flags: MessageFlags.Ephemeral });
    }
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ Usuário não encontrado neste servidor.', flags: MessageFlags.Ephemeral });
    }
    const eDono = interaction.guild.ownerId === interaction.user.id;
    if (!eDono && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
      return interaction.reply({ content: '❌ O cargo deste usuário é igual ou superior ao seu.', flags: MessageFlags.Ephemeral });
    }
    if (!member.kickable) {
      return interaction.reply({ content: '❌ Eu não consigo expulsar este usuário (cargo acima do meu ou dono do servidor).', flags: MessageFlags.Ephemeral });
    }
    try {
      await member.kick(motivo);
      await interaction.reply({ content: `✅ ${user.tag} foi expulso.\nMotivo: ${motivo}` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Não foi possível expulsar este usuário.', flags: MessageFlags.Ephemeral });
    }
  }
};