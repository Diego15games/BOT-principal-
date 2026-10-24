import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banir um membro')
    .addUserOption(option =>
      option.setName('usuario').setDescription('Usuário para banir').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('motivo').setDescription('Motivo do banimento')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Não informado';

    if (!interaction.guild) {
      return interaction.reply({ content: '❌ Este comando só funciona dentro de um servidor.', flags: MessageFlags.Ephemeral });
    }
    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Você não pode banir a si mesmo.', flags: MessageFlags.Ephemeral });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member) {
      const eDono = interaction.guild.ownerId === interaction.user.id;
      if (!eDono && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
        return interaction.reply({ content: '❌ O cargo deste usuário é igual ou superior ao seu.', flags: MessageFlags.Ephemeral });
      }
      if (!member.bannable) {
        return interaction.reply({ content: '❌ Eu não consigo banir este usuário (cargo acima do meu ou dono do servidor).', flags: MessageFlags.Ephemeral });
      }
    }

    try {
      await interaction.guild.members.ban(user.id, { reason: motivo });
      return interaction.reply({ content: `✅ ${user.tag} foi banido.\nMotivo: ${motivo}` });
    } catch (err) {
      console.error('Erro ao banir usuário:', err);
      const resposta = { content: '❌ Não foi possível banir este usuário. Verifique minhas permissões.', flags: MessageFlags.Ephemeral };
      if (interaction.replied || interaction.deferred) return interaction.followUp(resposta);
      return interaction.reply(resposta);
    }
  }
};
