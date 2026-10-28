import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelTicket2() {

const embed = new EmbedBuilder()
.setColor("#57F287")
.setTitle("🎫 Sistema de Tickets (2/3)")
.setDescription("Personalize título, descrição, banner e cor do painel público.");

const row1 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("ticket_titulo")
.setLabel("Título")
.setEmoji("📝")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("ticket_descricao")
.setLabel("Descrição")
.setEmoji("📄")
.setStyle(ButtonStyle.Primary)

);

const row2 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("ticket_banner")
.setLabel("Banner")
.setEmoji("🖼️")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("ticket_cor")
.setLabel("Cor")
.setEmoji("🎨")
.setStyle(ButtonStyle.Secondary)

);

const row3 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("painel_ticket")
.setLabel("⬅️ Página Anterior")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("ticket_pagina3")
.setLabel("Próxima Página")
.setEmoji("➡️")
.setStyle(ButtonStyle.Success)

);

return {
embeds: [embed],
components: [
row1,
row2,
row3
]
};

}