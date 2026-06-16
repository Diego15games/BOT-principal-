import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('server-info')
.setDescription('Informações do servidor'),

async execute(interaction) {

const guild = interaction.guild;

const embed =
new EmbedBuilder()
.setTitle(guild.name)
.setThumbnail(
guild.iconURL()
)
.addFields(
{
name: '👥 Membros',
value: `${guild.memberCount}`,
inline: true
},
{
name: '📅 Criado em',
value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
inline: true
},
{
name: '🆔 ID',
value: guild.id,
inline: true
}
)
.setColor(0x5865F2);

await interaction.reply({
embeds: [embed]
});

}
};
