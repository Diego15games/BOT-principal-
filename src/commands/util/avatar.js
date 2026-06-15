import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('avatar')
.setDescription('Ver avatar de um usuário')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Usuário')
),

async execute(interaction) {

const user =
interaction.options.getUser(
'usuario'
) || interaction.user;

const embed =
new EmbedBuilder()
.setTitle(
"Avatar de ${user.username}"
)
.setImage(
user.displayAvatarURL({
size: 4096
})
)
.setColor(0x5865F2);

await interaction.reply({
embeds: [embed]
});

}
};
