import {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
removeWarning
} from '../../systems/staff.js';

export default {
data: new SlashCommandBuilder()
.setName('removeradvertencia')
.setDescription(
'Remover uma advertência de um membro'
)
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
removeWarning(
usuario.id
);

if (!dados) {

return interaction.reply({
content:
'❌ Este usuário não possui registros.',
ephemeral: true
});

}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'✅ Advertência Removida'
)
.setDescription(
`${usuario} teve uma advertência removida.`
)
.addFields(
{
name:
'Advertências Restantes',
value:
`${dados.advertencias}`
}
)
],
ephemeral: true
});

}
};
