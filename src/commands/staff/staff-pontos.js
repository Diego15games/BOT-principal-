import {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
addPoints
} from '../../systems/staff.js';

export default {
data: new SlashCommandBuilder()
.setName('staff-pontos')
.setDescription('Adicionar pontos para um staff')
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Staff')
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName('quantidade')
.setDescription('Quantidade')
.setRequired(true)
),

cooldown: 3,

async execute(interaction) {

const usuario = interaction.options.getUser('usuario');
const quantidade = interaction.options.getInteger('quantidade');

const dados = addPoints(
  usuario.id,
  quantidade
);

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(
        `✅ ${usuario} agora possui **${dados.pontos} pontos**.`
      )
  ]
});

}
};