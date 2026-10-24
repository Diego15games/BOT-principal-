import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelRegistro3() {
const embed = new EmbedBuilder()
.setColor("#57F287")
.setTitle("📝 Sistema de Registro (3/3)")
.setDescription("Personalize os botões do painel de registro.");

const row1 = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("registro_botao_registrar").setLabel("Botão Registrar").setEmoji("📝").setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId("registro_botao_atualizar").setLabel("Botão Atualizar").setEmoji("🔄").setStyle(ButtonStyle.Primary)
);
const row2 = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("painel_principal").setLabel("🏠 Voltar Painel Principal").setStyle(ButtonStyle.Danger),
new ButtonBuilder().setCustomId("registro_preview").setLabel("Pré-visualização").setEmoji("👀").setStyle(ButtonStyle.Secondary)
);
const row3 = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("painel_registro2").setLabel("⬅️ Página Anterior").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("registro_enviar").setLabel("Enviar Painel").setEmoji("📤").setStyle(ButtonStyle.Success)
);
return { embeds:[embed], components:[row1,row2,row3] };
}
