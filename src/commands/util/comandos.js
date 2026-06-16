import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import fs from 'fs';

export default {
data: new SlashCommandBuilder()
.setName('comandos')
.setDescription('Lista todos os comandos do bot'),

async execute(interaction) {

const comandos = [];

const pastas =
fs.readdirSync('./src/commands');

for (const pasta of pastas) {

const arquivos =
fs.readdirSync(`./src/commands/${pasta}`)
.filter(file => file.endsWith('.js'));

for (const arquivo of arquivos) {

comandos.push(
`/${arquivo.replace('.js', '')}`
);

}

}

const embed =
new EmbedBuilder()
.setColor(0x5865F2)
.setTitle('📜 Comandos do Bot')
.setDescription(
comandos.sort().join('\n')
);

await interaction.reply({
embeds: [embed]
});

}
};
