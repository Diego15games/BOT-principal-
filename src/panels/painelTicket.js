import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { staffRoleIds } from '../systems/tickets.js';

// Página 1/3 de um ticket: canal, categoria, cargos e logs.
export function painelTicket(tipo) {
  const id = tipo.tipoId;
  const cargos = staffRoleIds(tipo);

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle(`🎫 ${tipo.nome} (1/3)`)
    .setDescription('Configure o canal, a categoria, os cargos e os logs deste ticket.')
    .addFields(
      { name: '📢 Canal do painel', value: tipo.panelChannelId ? `<#${tipo.panelChannelId}>` : '*não definido*', inline: true },
      { name: '📂 Categoria', value: tipo.categoryId ? `<#${tipo.categoryId}>` : '*não definida*', inline: true },
      { name: '👮 Cargos staff', value: cargos.length ? cargos.map(c => `<@&${c}>`).join(' ') : '*não definidos*' },
      { name: '📜 Canal de logs', value: tipo.logChannelId ? `<#${tipo.logChannelId}>` : '*não definido*', inline: true }
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_canal:${id}`).setLabel('Canal do Painel').setEmoji('📢').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ticket_categoria:${id}`).setLabel('Categoria dos Tickets').setEmoji('📂').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_staff:${id}`).setLabel('Cargos Staff').setEmoji('👮').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`ticket_logs:${id}`).setLabel('Canal Logs').setEmoji('📜').setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_pagina2:${id}`).setLabel('Próxima Página').setEmoji('➡️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('painel_ticket').setLabel('Lista de Tickets').setEmoji('📋').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`ticket_excluir:${id}`).setLabel('Excluir').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}
