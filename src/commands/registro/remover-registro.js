import {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
removerRegistro
} from '../../systems/registro.js';

export default {
data: new SlashCommandBuilder()
.setName('remover-registro')
.setDescription('Remover registro')
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Usuário')
.setRequired(true)
),

async execute(interaction) {

const usuario =
  interaction.options.getUser('usuario');

const removido =
  removerRegistro(usuario.id);

if (!removido) {
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xed4245)
        .setDescription('❌ Registro não encontrado.')
    ]
  });
}

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(
        `✅ Registro de ${usuario} removido.`
      )
  ]
});

}
};