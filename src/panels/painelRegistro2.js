import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelRegistro2() {

const embed = new EmbedBuilder()
.setColor("#57F287")
.setTitle("📝 Sistema de Registro (2/2)")
.setDescription("Configurações visuais do painel.");

const row1 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("registro_titulo")
.setLabel("Título")
.setEmoji("📝")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("registro_descricao")
.setLabel("Descrição")
.setEmoji("📄")
.setStyle(ButtonStyle.Primary)

);

const row2 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("registro_banner")
.setLabel("Banner")
.setEmoji("🖼️")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("registro_cor")
.setLabel("Cor")
.setEmoji("🎨")
.setStyle(ButtonStyle.Secondary)

);

const row3 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("registro_msg")
.setLabel("Mensagem de Sucesso")
.setEmoji("💬")
.setStyle(ButtonStyle.Success)

);

const row4 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("painel_registro")
.setLabel("⬅️ Página Anterior")
.setStyle(ButtonStyle.Primary)

);

const row5 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("painel_principal")
.setLabel("🏠 Painel Principal")
.setStyle(ButtonStyle.Danger)

);

new ButtonBuilder()
.setCustomId("registro_pagina3")
.setLabel("Próxima Página")
.setEmoji("➡️")
.setStyle(ButtonStyle.Primary)

return {

embeds:[embed],

components:[
row1,
row2,
row3,
row4,
row5
]

};

}
