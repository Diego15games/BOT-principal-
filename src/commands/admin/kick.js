import {
SlashCommandBuilder,
PermissionFlagsBits
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('kick')
.setDescription('Expulsar um membro')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Usuário para expulsar')
.setRequired(true)
)
.addStringOption(option =>
option
.setName('motivo')
.setDescription('Motivo da expulsão')
)
.setDefaultMemberPermissions(
PermissionFlagsBits.KickMembers
),

async execute(interaction) {

const user =
interaction.options.getUser(
'usuario'
);

const motivo =
interaction.options.getString(
'motivo'
) || 'Não informado';

const member =
interaction.guild.members.cache.get(
user.id
);

if (!member) {
return interaction.reply({
content:
'❌ Usuário não encontrado.',
ephemeral: true
});
}

try {

await member.kick(
motivo
);

await interaction.reply({
content:
"✅ ${user.tag} foi expulso.\nMotivo: ${motivo}"
});

} catch {

await interaction.reply({
content:
'❌ Não foi possível expulsar este usuário.',
ephemeral: true
});
}

}
};
