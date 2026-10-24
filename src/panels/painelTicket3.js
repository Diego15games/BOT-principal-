import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelTicket3() {

const embed = new EmbedBuilder()
.setColor("#57F287")
.setTitle("🎫 Sistema de Tickets (3/3)")
.setDescription("Finalize as configurações do painel de tickets.");

const row1 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("ticket_botao")
.setLabel("Nome do Botão")
.setEmoji("🎫")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("ticket_emoji")
.setLabel("Emoji do Botão")
.setEmoji("😀")
.setStyle(ButtonStyle.Primary)

);

const row2 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("painel_principal")
.setLabel("🏠 Painel Principal")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("ticket_preview")
.setLabel("Pré-visualização")
.setEmoji("👀")
.setStyle(ButtonStyle.Secondary)

);

const row3 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("painel_ticket2")
.setLabel("⬅️ Página Anterior")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("ticket_enviar")
.setLabel("Enviar Painel")
.setEmoji("📤")
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