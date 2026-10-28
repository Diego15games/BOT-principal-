import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelTicket() {
const embed = new EmbedBuilder()
.setColor("#57F287")
.setTitle("🎫 Sistema de Tickets (1/3)")
.setDescription("Configure o sistema de tickets.");

const row1 = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("ticket_canal").setLabel("Canal do Painel").setEmoji("📢").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("ticket_categoria").setLabel("Categoria dos Tickets").setEmoji("📂").setStyle(ButtonStyle.Secondary)
);
const row2 = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("ticket_staff").setLabel("Cargos Staff").setEmoji("👮").setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId("ticket_logs").setLabel("Canal Logs").setEmoji("📜").setStyle(ButtonStyle.Secondary)
);
const row3 = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("ticket_pagina2").setLabel("Próxima Página").setEmoji("➡️").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("painel_principal").setLabel("🏠 Painel Principal").setStyle(ButtonStyle.Danger)
);
return { embeds:[embed], components:[row1,row2,row3] };
}
