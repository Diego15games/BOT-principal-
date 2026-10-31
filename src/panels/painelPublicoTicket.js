import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

// Só aceita emoji válido (unicode ou personalizado) para o botão não falhar.
const EMOJI_VALIDO =
  /^(<a?:\w+:\d+>|\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200d\ufe0f]*)$/u;

// Painel público com o botão "Abrir Ticket" de um tipo de ticket.
export function painelPublicoTicket(tipo) {
  const embed = new EmbedBuilder()
    .setColor(tipo?.cor || '#57F287')
    .setTitle(tipo?.titulo || '🎫 Suporte')
    .setDescription(
      tipo?.descricao ||
      'Clique no botão abaixo para abrir um ticket.'
    );

  if (tipo?.banner) {
    embed.setImage(tipo.banner);
  }

  const botao = new ButtonBuilder()
    .setCustomId(`ticket_abrir:${tipo?.tipoId || 'principal'}`)
    .setLabel(String(tipo?.botao || 'Abrir Ticket').slice(0, 80))
    .setStyle(ButtonStyle.Success);

  const emoji = String(tipo?.emoji || '🎫').trim();
  if (EMOJI_VALIDO.test(emoji)) {
    botao.setEmoji(emoji);
  }

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(botao)]
  };
}
