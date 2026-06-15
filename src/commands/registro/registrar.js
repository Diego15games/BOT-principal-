import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
registrar
} from '../../systems/registro.js';

export default {
data: new SlashCommandBuilder()
.setName('registrar')
.setDescription('Registrar um jogador')
.addStringOption(option =>
option
.setName('nick')
.setDescription('Nick do jogador')
.setRequired(true)
),

async execute(interaction) {

const nick =
  interaction.options.getString('nick');

registrar(
  interaction.user.id,
  nick
);

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(
        `✅ Registro criado para **${nick}**`
      )
  ]
});

}
};