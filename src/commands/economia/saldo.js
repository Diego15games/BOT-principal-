import {
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';

import { getBalance } from '../../systems/economia.js';

export default {
  data: new SlashCommandBuilder()
    .setName('saldo')
    .setDescription('Consultar saldo')
    .addUserOption(option => option.setName('usuario').setDescription('Usuário para consultar').setRequired(false)),
  cooldown: 3,
  async execute(interaction) {
    const usuario = interaction.options.getUser('usuario') || interaction.user;
    const saldo = await getBalance(usuario.id);
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle('💰 Saldo')
          .setDescription(`**${usuario.username}** possui **R$ ${Number(saldo || 0).toLocaleString('pt-BR')}**.`)
          .setThumbnail(usuario.displayAvatarURL())
      ]
    });
  }
};