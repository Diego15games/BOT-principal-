import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('userinfo')
.setDescription('Ver informações de um membro')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Membro')
),

async execute(interaction) {

const user =
interaction.options.getUser(
'usuario'
) || interaction.user;

const member =
interaction.guild.members.cache.get(
user.id
);

const cargos =
member.roles.cache
.filter(role => role.id !== interaction.guild.id)
.map(role => role.toString())
.join(', ') || 'Nenhum';

const embed =
new EmbedBuilder()
.setTitle("Informações de ${user.username}")
.setThumbnail(
user.displayAvatarURL()
)
.addFields(
{
name: '🆔 ID',
value: user.id
},
{
name: '📅 Conta criada',
value: "<t:${Math.floor(user.createdTimestamp / 1000)}:D>"
},
{
name: '📥 Entrou no servidor',
value: "<t:${Math.floor(member.joinedTimestamp / 1000)}:D>"
},
{
name: '🎭 Cargos',
value: cargos
}
)
.setColor(0x5865F2);

await interaction.reply({
embeds: [embed]
});

}
};
