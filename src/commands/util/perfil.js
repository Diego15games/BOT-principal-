import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
pegarRegistro
} from '../../systems/registro.js';

import {
pegarXP
} from '../../systems/xp.js';

export default {

data:
new SlashCommandBuilder()

.setName('perfil')

.setDescription(
'Mostra o perfil de um jogador'
)

.addUserOption(option =>
option
.setName('usuario')
.setDescription(
'Usuário'
)
.setRequired(false)
),

async execute(interaction) {

const usuario =
interaction.options.getUser(
'usuario'
) || interaction.user;

const membro =
await interaction.guild.members.fetch(
usuario.id
);

const registro =
await pegarRegistro(
usuario.id
);

if (!registro) {

return interaction.reply({
content:
'❌ Esse usuário não está registrado.',
ephemeral: true
});

}

const dadosXP =
await pegarXP(
usuario.id
);

const xp =
dadosXP?.xp || 0;

const level =
dadosXP?.level || 0;

const cor =
membro.displayHexColor === '#000000'
? 0x5865F2
: membro.displayHexColor;

const embed =
new EmbedBuilder()

.setColor(cor)

.setAuthor({
name: '👤 Perfil do Player',
iconURL: usuario.displayAvatarURL()
})

.setThumbnail(
usuario.displayAvatarURL({
size: 1024
})
)

.setTitle(`✨ ${membro.displayName}`)

.setDescription(
[
'╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮',
'        👤 **PERFIL DO PLAYER**',
'╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯',
'',
'👤 **Usuário**',
`> ${usuario}`,
'',
'🏷️ **Nome de Exibição**',
`> ${membro.displayName}`,
'',
'🎮 **Nick Name**',
`> ${registro.nick}`,
'',
'📱 **Plataforma**',
`> ${registro.plataforma}`,
'',
'🌈 **Sexualidade**',
`> ${registro.sexualidade}`,
'',
'━━━━━━━━━━━━━━━━━━━━',
'',
'⭐ **Nível**',
`> **${level}**`,
'',
'💎 **XP Atual**',
`> **${xp} XP**`,
'',
'🏅 **Cargo Atual**',
`> ${membro.roles.highest}`,
'',
'━━━━━━━━━━━━━━━━━━━━',
'',
'🆔 **ID**',
`> ${usuario.id}`,
'',
'📥 **Entrou no servidor**',
`> <t:${Math.floor(membro.joinedTimestamp / 1000)}:D>`
  
].join('\n')
)

.setImage(
'https://i.imgur.com/QK6Jm7L.png'
)

.setFooter({
text:
'XT BOT • Sistema de Perfil'
})

.setTimestamp();

return interaction.reply({
embeds: [embed]
});

}

};
