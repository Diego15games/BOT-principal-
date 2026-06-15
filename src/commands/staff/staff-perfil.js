import {
SlashCommandBuilder,
EmbedBuilder
} from 'discord.js';

import { getStaff } from '../../systems/staff.js';
import { getMoney } from '../../systems/economia.js';

export default {
data: new SlashCommandBuilder()
.setName('staff-perfil')
.setDescription('Perfil completo do staff')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Usuário')
.setRequired(true)
),

cooldown: 3,

async execute(interaction) {

const usuario =
  interaction.options.getUser('usuario');

const staff =
  getStaff(usuario.id);

const saldo =
  getMoney(usuario.id);

const embed = new EmbedBuilder()
  .setColor(0x3498db)
  .setTitle('👮 Perfil Staff')
  .setThumbnail(usuario.displayAvatarURL())
  .addFields(
    {
      name: '👤 Usuário',
      value: `${usuario.tag}`
    },
    {
      name: '⭐ Pontos',
      value: `${staff.pontos}`,
      inline: true
    },
    {
      name: '🎫 Tickets',
      value: `${staff.tickets}`,
      inline: true
    },
    {
      name: '⚠ Advertências',
      value: `${staff.advertencias}`,
      inline: true
    },
    {
      name: '💰 Saldo',
      value: `R$ ${saldo.toLocaleString('pt-BR')}`
    }
  );

return interaction.reply({
  embeds: [embed]
});

}
};