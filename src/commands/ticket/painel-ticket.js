import {
SlashCommandBuilder,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
PermissionFlagsBits
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('painel-ticket')
.setDescription('Enviar painel de tickets')
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

async execute(interaction) {

const embed = new EmbedBuilder()
  .setColor(0x3498db)
  .setTitle('🎫 Central de Suporte')
  .setDescription(
    'Clique no botão abaixo para abrir um ticket.'
  );

const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('open_ticket')
      .setLabel('Abrir Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary)
  );

await interaction.channel.send({
  embeds: [embed],
  components: [row]
});

return interaction.reply({
  content: '✅ Painel enviado.',
  ephemeral: true
});

}
};