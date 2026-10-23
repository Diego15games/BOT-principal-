import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
transferMoney
} from '../../systems/economia.js';

export default {
data: new SlashCommandBuilder()
.setName('pagar')
.setDescription('Transferir dinheiro para outro usuário')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Usuário que receberá')
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName('valor')
.setDescription('Valor da transferência')
.setRequired(true)
),

cooldown: 3,

async execute(interaction) {

const usuario =
interaction.options.getUser(
'usuario'
);

const valor =
interaction.options.getInteger(
'valor'
);

if (valor <= 0) {

return interaction.reply({
content:
'❌ Valor inválido.',
ephemeral: true
});

}

if (
usuario.id ===
interaction.user.id
) {

return interaction.reply({
content:
'❌ Você não pode pagar a si mesmo.',
ephemeral: true
});

}

const sucesso =
await transferMoney(
interaction.user.id,
usuario.id,
valor
);

if (!sucesso) {

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0xed4245)
.setDescription(
'❌ Saldo insuficiente.'
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
"✅ Você transferiu **R$ ${valor.toLocaleString('pt-BR')}** para ${usuario}."
)
]
});

}
};
