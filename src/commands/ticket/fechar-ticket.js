import {
SlashCommandBuilder
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('fechar-ticket')
.setDescription('Fechar ticket'),

async execute(interaction) {

await interaction.reply({
  content: '🔒 Fechando ticket...'
});

setTimeout(() => {
  interaction.channel.delete()
    .catch(() => {});
}, 3000);

}
};