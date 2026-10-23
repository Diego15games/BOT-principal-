import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags
} from 'discord.js';

import { receberGranaPendente } from '../../systems/economia.js';
import { CANAL_COMANDOS } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('receber')
    .setDescription('Receber dinheiro liberado pela staff'),

  cooldown: 3,

  async execute(interaction) {
    if (interaction.channelId !== CANAL_COMANDOS) {
      return interaction.reply({
        content: '❌ Use este comando apenas no canal de comandos.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Operação atômica: soma ao saldo e zera o pendente de uma vez.
    const valor = await receberGranaPendente(interaction.user.id);

    if (!valor) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setDescription('❌ Você não possui dinheiro pendente.')
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle('💰 Dinheiro Recebido')
          .setDescription(
            `✅ Você recebeu **R$ ${valor.toLocaleString('pt-BR')}**.`
          )
      ]
    });
  }
};
