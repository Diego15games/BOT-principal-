import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import {
verificarRegistro
} from '../../systems/registro.js';

export default {
data: new SlashCommandBuilder()
.setName('verificar')
.setDescription('Verificar registro')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Usuário')
.setRequired(true)
),

async execute(interaction) {

const usuario =
  interaction.options.getUser('usuario');

const registro =
  verificarRegistro(usuario.id);

if (!registro) {
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xed4245)
        .setDescription('❌ Usuário não registrado.')
    ]
  });
}

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('📋 Registro')
      .addFields(
        {
          name: '👤 Usuário',
          value: `${usuario}`
        },
        {
          name: '🎮 Nick',
          value: registro.nick
        }
      )
  ]
});

}
};