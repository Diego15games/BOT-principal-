import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import fs from 'fs';

export default {
data: new SlashCommandBuilder()
.setName('sistemas')
.setDescription('Lista todos os sistemas do bot'),

async execute(interaction) {

const pastas =
fs.readdirSync('./src/commands');

const sistemas =
pastas.map(
pasta => "⚙️ ${pasta}"
);

const embed =
new EmbedBuilder()
.setColor(0x57F287)
.setTitle('📦 Sistemas do Bot')
.setDescription(
sistemas.join('\n')
);

await interaction.reply({
embeds: [embed]
});

}
};
