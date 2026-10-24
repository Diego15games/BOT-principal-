import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Mostrar avatar de um usuário')
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024 });
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`Avatar de ${user.username}`).setImage(avatar).setURL(avatar)]
    });
  }
};