import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
getRanking
} from '../../systems/economia.js';

export default {
data: new SlashCommandBuilder()
.setName('ranking')
.setDescription('Ranking dos mais ricos'),

cooldown: 5,

async execute(interaction) {

const ranking =
await getRanking();

if (!ranking.length) {

return interaction.reply({
content:
'❌ Nenhum dado encontrado.'
});

}

let texto = '';

for (
let i = 0;
i < ranking.length;
i++
) {

const user =
ranking[i];

texto +=
"**${i + 1}º** <@${user.userId}> - R$ ${( user.money || 0 ).toLocaleString('pt-BR')}\n";

}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0xf1c40f)
.setTitle(
'🏆 Ranking Econômico'
)
.setDescription(texto)
]
});

}
};
