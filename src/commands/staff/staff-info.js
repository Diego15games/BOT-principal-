import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
getStaff
} from '../../systems/staff.js';

export default {
data: new SlashCommandBuilder()
.setName('staff-info')
.setDescription('Ver informações de um staff')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Staff')
.setRequired(true)
),

cooldown: 3,

async execute(interaction) {

const usuario = interaction.options.getUser('usuario');

const dados = getStaff(usuario.id);

const embed = new EmbedBuilder()
  .setColor(0x3498db)
  .setTitle('👮 Informações Staff')
  .setDescription(
    `👤 Usuário: ${usuario}\n` +
    `⭐ Pontos: ${dados.pontos}\n` +
    `🎫 Tickets: ${dados.tickets}\n` +
    `⚠ Advertências: ${dados.advertencias}`
  );

return interaction.reply({
  embeds: [embed]
});

}
};