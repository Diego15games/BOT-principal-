import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
addMoney
} from '../../systems/economia.js';

export default {
data: new SlashCommandBuilder()
.setName('receber')
.setDescription('Receber dinheiro enviado pela staff'),

cooldown: 3,

async execute(interaction) {

const valor =
global.granaPendente?.[
interaction.user.id
];

if (!valor) {

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0xed4245)
.setDescription(
'❌ Você não possui dinheiro pendente.'
)
],
ephemeral: true
});

}

await addMoney(
interaction.user.id,
valor
);

delete global.granaPendente[
interaction.user.id
];

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setDescription(
"✅ Você recebeu **R$ ${valor.toLocaleString('pt-BR')}**."
)
]
});

}
};
