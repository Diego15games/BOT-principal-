import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelTicket(){

const embed=new EmbedBuilder()
.setColor("#FEE75C")
.setTitle("🎫 Sistema de Tickets")
.setDescription("Configure os tickets.");

const row1=new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("ticket_categoria")
.setLabel("Categoria")
.setEmoji("📂")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("ticket_staff")
.setLabel("Cargo Staff")
.setEmoji("🛡️")
.setStyle(ButtonStyle.Success)

);

const row2=new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("ticket_logs")
.setLabel("Canal Logs")
.setEmoji("📋")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("ticket_painel")
.setLabel("Enviar Painel")
.setEmoji("📨")
.setStyle(ButtonStyle.Secondary)

);

const row3=new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("painel_principal")
.setLabel("Voltar")
.setEmoji("⬅️")
.setStyle(ButtonStyle.Danger)

);

return{
embeds:[embed],
components:[row1,row2,row3]
};

}
