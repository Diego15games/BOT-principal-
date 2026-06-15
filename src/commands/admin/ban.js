import {
SlashCommandBuilder,
PermissionFlagsBits
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('ban')
.setDescription('Banir um membro')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Usuário para banir')
.setRequired(true)
)
.addStringOption(option =>
option
.setName('motivo')
.setDescription('Motivo do banimento')
)
.setDefaultMemberPermissions(
PermissionFlagsBits.BanMembers
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

await member.ban({
reason: motivo
});

await interaction.reply({
content:
"✅ ${user.tag} foi banido.\nMotivo: ${motivo}"
});

} catch {

await interaction.reply({
content:
'❌ Não foi possível banir este usuário.',
ephemeral: true
});
}

}
};
