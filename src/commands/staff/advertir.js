import {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
addWarning
} from '../../systems/staff.js';

export default {
data: new SlashCommandBuilder()
.setName('advertir')
.setDescription('Advertir um membro')
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Membro')
.setRequired(true)
)
.addStringOption(option =>
option
.setName('motivo')
.setDescription('Motivo da advertência')
.setRequired(true)
),

cooldown: 3,

async execute(interaction) {

const usuario =
interaction.options.getUser(
'usuario'
);

const motivo =
interaction.options.getString(
'motivo'
);

const dados =
addWarning(
usuario.id,
motivo,
interaction.user.id
);

try {

await usuario.send({
embeds: [
new EmbedBuilder()
.setColor(0xed4245)
.setTitle('⚠ Advertência')
.setDescription(
`Você recebeu uma advertência em **${interaction.guild.name}**.`
)
.addFields(
{
name: 'Motivo',
value: motivo
},
{
name: 'Total de Advertências',
value: `${dados.advertencias}`
}
)
]
});

} catch {}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0xed4245)
.setTitle('⚠ Advertência Aplicada')
.setDescription(
`${usuario} recebeu uma advertência.`
)
.addFields(
{
name: 'Motivo',
value: motivo
},
{
name: 'Total de Advertências',
value: `${dados.advertencias}`
}
)
],
ephemeral: true
});

}
};
