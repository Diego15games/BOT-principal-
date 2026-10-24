import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelGeral(){

const embed=new EmbedBuilder()
.setColor("#5865F2")
.setTitle("⚙️ Configurações Gerais")
.setDescription("Configurações do servidor.");

const row1=new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("geral_logs")
.setLabel("Logs")
.setEmoji("📋")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("geral_boasvindas")
.setLabel("Boas-vindas")
.setEmoji("👋")
.setStyle(ButtonStyle.Success)

);

const row2=new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("geral_saida")
.setLabel("Saída")
.setEmoji("📤")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("geral_cor")
.setLabel("Cor Embeds")
.setEmoji("🎨")
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
