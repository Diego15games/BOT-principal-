import {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
getStaff
} from '../../systems/staff.js';

export default {
data: new SlashCommandBuilder()
.setName('advertencias')
.setDescription('Ver advertências de um membro')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Membro')
.setRequired(true)
)
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

cooldown: 3,

async execute(interaction) {

const usuario =
interaction.options.getUser(
'usuario'
);

const dados =
getStaff(
usuario.id
);

let historico =
'Nenhuma advertência registrada.';

if (
dados.historico &&
dados.historico.length > 0
) {

historico =
dados.historico
.slice()
.reverse()
.slice(0, 10)
.map(
(item, index) =>
`${index + 1}. ${item.motivo}

👮 Staff: <@${item.staffId}>
📅 Data: ${item.data}`
)
.join('\n\n');

}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0xf1c40f)
.setTitle(
'📋 Histórico de Advertências'
)
.setDescription(
`Usuário: ${usuario}`
)
.addFields(
{
name:
'Total de Advertências',
value:
`${dados.advertencias}`,
inline: true
},
{
name:
'Histórico',
value:
historico
}
)
],
ephemeral: true
});

}
};
