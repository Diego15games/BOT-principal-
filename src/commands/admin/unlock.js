import {
SlashCommandBuilder,
PermissionFlagsBits
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('unlock')
.setDescription('Destrancar canal')
.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
async execute(interaction) {
await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
SendMessages: null
});
await interaction.reply({ content: '🔓 Canal destrancado com sucesso.' });
}
};