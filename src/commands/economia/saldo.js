import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
getMoney
} from '../../systems/economia.js';

export default {
data: new SlashCommandBuilder()
.setName('saldo')
.setDescription('Ver seu saldo'),

cooldown: 3,

async execute(interaction) {

const saldo = getMoney(interaction.user.id);

const embed = new EmbedBuilder()
  .setColor(0x57f287)
  .setTitle('💰 Saldo')
  .setDescription(
    `Você possui **R$ ${saldo.toLocaleString('pt-BR')}**`
  );

return interaction.reply({
  embeds: [embed]
});

}
};