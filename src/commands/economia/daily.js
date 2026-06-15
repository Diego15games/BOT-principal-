import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
claimDaily
} from '../../systems/economia.js';

export default {
data: new SlashCommandBuilder()
.setName('daily')
.setDescription('Resgatar recompensa diária'),

cooldown: 3,

async execute(interaction) {

const success = claimDaily(interaction.user.id);

if (!success) {
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xed4245)
        .setDescription(
          '⏳ Você já resgatou seu daily hoje.'
        )
    ],
    ephemeral: true
  });
}

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(
        '✅ Você recebeu **R$ 1.000**.'
      )
  ]
});

}
};