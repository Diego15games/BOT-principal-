import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

// Página 2/3 de um ticket: título, descrição, banner e cor do painel público.
export function painelTicket2(tipo) {
  const id = tipo.tipoId;

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle(`🎫 ${tipo.nome} (2/3)`)
    .setDescription('Personalize o que aparece **dentro do ticket** quando ele é aberto: título, descrição, banner e cor. A primeira linha da descrição também aparece no menu do painel.');

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_titulo:${id}`).setLabel('Título').setEmoji('📝').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ticket_descricao:${id}`).setLabel('Descrição').setEmoji('📄').setStyle(ButtonStyle.Primary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_banner:${id}`).setLabel('Banner').setEmoji('🖼️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`ticket_cor:${id}`).setLabel('Cor').setEmoji('🎨').setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_pagina1:${id}`).setLabel('⬅️ Página Anterior').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ticket_pagina3:${id}`).setLabel('Próxima Página').setEmoji('➡️').setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}
