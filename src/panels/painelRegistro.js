import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelRegistro() {

const embed = new EmbedBuilder()
.setColor("#57F287")
.setTitle("📝 Sistema de Registro")
.setDescription("Configure o sistema de registro.");

const row1 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("registro_cargo")
.setLabel("Cargo Registrado")
.setEmoji("✅")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("registro_naoreg")
.setLabel("Cargo Não Registrado")
.setEmoji("❌")
.setStyle(ButtonStyle.Danger)

);

const row2 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("registro_canal")
.setLabel("Canal Registro")
.setEmoji("📁")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("registro_painel")
.setLabel("Painel Registro")
.setEmoji("📝")
.setStyle(ButtonStyle.Primary)

);

const row3 = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("painel_principal")
.setLabel("Voltar")
.setEmoji("⬅️")
.setStyle(ButtonStyle.Danger)

);

return {
embeds:[embed],
components:[row1,row2,row3]
};

}
