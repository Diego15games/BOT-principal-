import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelRegistro() {

const embed = new EmbedBuilder()
.setColor("#57F287")
.setTitle("📝 Sistema de Registro (1/3)")
.setDescription("Configure o sistema de registro.");

const row1 = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId("registro_cargo")
.setLabel("Cargo Registrado")
.setEmoji("🎭")
.setStyle(ButtonStyle.Success),
new ButtonBuilder()
.setCustomId("registro_nao")
.setLabel("Cargo Não Registrado")
.setEmoji("🚫")
.setStyle(ButtonStyle.Danger)
);

const row2 = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId("registro_canal")
.setLabel("Canal Registro")
.setEmoji("📁")
.setStyle(ButtonStyle.Primary),
new ButtonBuilder()
.setCustomId("registro_logs")
.setLabel("Canal Logs")
.setEmoji("📑")
.setStyle(ButtonStyle.Secondary)
);

const row3 = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId("painel_principal")
.setLabel("Voltar Painel Principal")
.setEmoji("⬅️")
.setStyle(ButtonStyle.Danger),
new ButtonBuilder()
.setCustomId("registro_pagina2")
.setLabel("Próxima Página")
.setEmoji("➡️")
.setStyle(ButtonStyle.Success)
);

return { embeds:[embed], components:[row1,row2,row3] };
}
