import {
SlashCommandBuilder
} from 'discord.js';

import {
callStaff
} from '../../systems/tickets.js';

export default {
data: new SlashCommandBuilder()
.setName('chama-staff')
.setDescription('Chamar um staff')
.addUserOption(option =>
option
.setName('staff')
.setDescription('Staff')
.setRequired(true)
),

async execute(interaction) {

const staff =
  interaction.options.getUser('staff');

callStaff(
  interaction.channel.id,
  staff.id
);

await interaction.channel.send({
  content:
    `📢 ${staff} foi chamado para este ticket.`
});

return interaction.reply({
  content: '✅ Staff chamado.',
  ephemeral: true
});

}
};