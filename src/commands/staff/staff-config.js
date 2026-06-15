import {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} from 'discord.js';

import fs from 'fs';

const PATH = './database/staffConfig.json';

export default {
data: new SlashCommandBuilder()
.setName('staff-config')
.setDescription('Configurar cargo da staff')
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addRoleOption(option =>
option
.setName('cargo')
.setDescription('Cargo da equipe')
.setRequired(true)
),

cooldown: 3,

async execute(interaction) {

const cargo = interaction.options.getRole('cargo');

fs.writeFileSync(
  PATH,
  JSON.stringify({
    staffRole: cargo.id
  }, null, 2)
);

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(
        `✅ Cargo staff configurado para ${cargo}`
      )
  ]
});

}
};