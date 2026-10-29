import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

// Painel público com o botão "Abrir Ticket".
// Usado na pré-visualização e no envio (Painel de Tickets 3/3).
export function painelPublicoTicket(config) {
  const embed = new EmbedBuilder()
    .setColor(config?.cor || '#57F287')
    .setTitle(config?.titulo || '🎫 Suporte')
    .setDescription(
      config?.descricao ||
      'Clique no botão abaixo para abrir um ticket.'
    );

  if (config?.banner) {
    embed.setImage(config.banner);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_abrir')
      .setLabel(config?.botao || 'Abrir Ticket')
      .setEmoji(config?.emoji || '🎫')
      .setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}
