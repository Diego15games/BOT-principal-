import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Mostrar perfil de um usuário')
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`👤 Perfil de ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'Usuário', value: `${user}`, inline: true },
        { name: 'Conta criada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Entrou no servidor', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'Não está no servidor', inline: true }
      );
    return interaction.reply({ embeds: [embed] });
  }
};