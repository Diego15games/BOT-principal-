import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelRegistro() {

const embed =
new EmbedBuilder()
.setColor("#57F287")
.setTitle("📝 Sistema de Registro")
.setDescription(
"Configure todo o sistema de registro pelos botões abaixo."
);

const row1 =
new ActionRowBuilder()
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

const row2 =
new ActionRowBuilder()
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

const row3 =
new ActionRowBuilder()
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

const row4 =
new ActionRowBuilder()
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

const row5 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("registro_msg")
.setLabel("Mensagem Sucesso")
.setEmoji("💬")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("registro_enviar")
.setLabel("Enviar Painel")
.setEmoji("📤")
.setStyle(ButtonStyle.Primary)

);

const row6 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("painel_principal")
.setLabel("Voltar")
.setEmoji("⬅️")
.setStyle(ButtonStyle.Danger)

);

return {

embeds:[embed],

components:[
row1,
row2,
row3,
row4,
row5,
row6
]

};

}
