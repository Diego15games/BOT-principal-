import {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
addWarning
} from '../../systems/staff.js';

export default {
data: new SlashCommandBuilder()
.setName('advertir')
.setDescription('Advertir um staff')
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Staff')
.setRequired(true)
),

cooldown: 3,

async execute(interaction) {

const usuario = interaction.options.getUser('usuario');

const dados = addWarning(usuario.id);

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription(
        `⚠ ${usuario} recebeu uma advertência.\nTotal: **${dados.advertencias}**`
      )
  ]
});

}
};