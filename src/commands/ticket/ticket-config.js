import {
SlashCommandBuilder,
PermissionFlagsBits,
EmbedBuilder
} from 'discord.js';

import fs from 'fs';

const PATH = './database/ticketConfig.json';

export default {
data: new SlashCommandBuilder()
.setName('ticket-config')
.setDescription('Configurar tickets')
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addRoleOption(option =>
option
.setName('staff')
.setDescription('Cargo staff')
.setRequired(false)
)
.addChannelOption(option =>
option
.setName('logs')
.setDescription('Canal logs')
.setRequired(false)
)
.addChannelOption(option =>
option
.setName('categoria')
.setDescription('Categoria tickets')
.setRequired(false)
),

async execute(interaction) {

const staff =
  interaction.options.getRole('staff');

const logs =
  interaction.options.getChannel('logs');

const categoria =
  interaction.options.getChannel('categoria');

const config = {
  staffId: staff?.id || '',
  logsId: logs?.id || '',
  categoryId: categoria?.id || ''
};

fs.writeFileSync(
  PATH,
  JSON.stringify(config, null, 2)
);

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(
        '✅ Configuração salva.'
      )
  ]
});

}
};