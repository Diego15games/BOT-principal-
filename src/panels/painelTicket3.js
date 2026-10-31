import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

// Página 3/3 de um ticket: botão do painel, pré-visualização e envio.
export function painelTicket3(tipo) {
  const id = tipo.tipoId;

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle(`🎫 ${tipo.nome} (3/3)`)
    .setDescription('Defina o botão do painel, veja a pré-visualização e envie o painel.');

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_botao:${id}`).setLabel('Nome do Botão').setEmoji('🎫').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`ticket_emoji:${id}`).setLabel('Emoji do Botão').setEmoji('😀').setStyle(ButtonStyle.Primary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('painel_ticket').setLabel('Lista de Tickets').setEmoji('📋').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`ticket_preview:${id}`).setLabel('Pré-visualização').setEmoji('👀').setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_pagina2:${id}`).setLabel('⬅️ Página Anterior').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ticket_enviar:${id}`).setLabel('Enviar Painel').setEmoji('📤').setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}
