import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
pegarRegistro
} from '../../systems/registro.js';

export default {
data: new SlashCommandBuilder()
.setName('perfil')
.setDescription('Ver perfil de um jogador')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Jogador')
),

async execute(interaction) {

const user =
interaction.options.getUser(
'usuario'
) || interaction.user;

const registro =
await pegarRegistro(
user.id
);

if (!registro) {

return interaction.reply({
content:
'❌ Este jogador não possui registro.',
ephemeral: true
});

}

const embed =
new EmbedBuilder()
.setColor(0x5865F2)
.setTitle(`👤 Perfil`)
.setThumbnail(
user.displayAvatarURL({
size: 1024
})
)
.addFields(
{
name: '👤 Nome',
value:
registro.nome ||
'Não informado',
inline: false
},
{
name: '⚧ Sexo',
value:
registro.sexualidade ||
'Não informado',
inline: false
},
{
name: '💻 Plataforma',
value:
registro.plataforma ||
'Não informada',
inline: false
}
)
.setFooter({
text: user.username
});

await interaction.reply({
embeds: [embed]
});

}
};
