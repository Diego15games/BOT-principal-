import {
SlashCommandBuilder,
PermissionFlagsBits,
MessageFlags,
ChannelType
} from 'discord.js';

import {
pegarConfigTickets
} from '../../systems/tickets.js';

import {
painelTicket
} from '../../panels/painelTicket.js';

export default {
data: new SlashCommandBuilder()
.setName('painel-ticket')
.setDescription('Publicar o painel de tickets no canal configurado')
.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

async execute(interaction) {
try {
const config = await pegarConfigTickets(interaction.guildId);

  if (!config?.panelChannelId) {
    return interaction.reply({
      content: '❌ Configure primeiro o canal com `/ticket-config`.',
      flags: MessageFlags.Ephemeral
    });
  }

  const canal = await interaction.guild.channels
    .fetch(config.panelChannelId)
    .catch(() => null);

  if (!canal || canal.type !== ChannelType.GuildText) {
    return interaction.reply({
      content: '❌ O canal configurado para o painel não existe ou não é um canal de texto.',
      flags: MessageFlags.Ephemeral
    });
  }

  await canal.send(painelTicket());

  return interaction.reply({
    content: `✅ Painel de tickets publicado em ${canal}.`,
    flags: MessageFlags.Ephemeral
  });
} catch (error) {
  console.error('Erro ao publicar painel de tickets:', error);

  return interaction.reply({
    content: '❌ Não foi possível publicar o painel de tickets.',
    flags: MessageFlags.Ephemeral
  });
}

}
};
