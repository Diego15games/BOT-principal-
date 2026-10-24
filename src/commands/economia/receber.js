import {
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';

import { claimDaily } from '../../systems/economia.js';

export default {
  data: new SlashCommandBuilder()
    .setName('receber')
    .setDescription('Receber sua recompensa diária'),
  cooldown: 5,
  async execute(interaction) {
    const resultado = await claimDaily(interaction.user.id);
    if (!resultado?.success) {
      const restante = resultado?.remaining
        ? ` Tente novamente em ${resultado.remaining}.`
        : '';
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xed4245).setDescription(`❌ Você já recebeu sua recompensa diária.${restante}`)],
        ephemeral: true
      });
    }
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`🎁 Você recebeu **R$ ${Number(resultado.amount || 0).toLocaleString('pt-BR')}**!`)]
    });
  }
};