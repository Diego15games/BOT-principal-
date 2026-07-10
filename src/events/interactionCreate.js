import {
Collection,
EmbedBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ActionRowBuilder,
ChannelType,
PermissionsBitField,
ButtonBuilder,
ButtonStyle
} from 'discord.js';

import fs from 'fs';

import {
criarRegistro,
atualizarRegistro,
pegarRegistro,
estaRegistrado,
pegarConfig,
salvarConfig,
salvarRegistroPendente,
pegarRegistroPendente,
removerRegistroPendente,
salvarMensagemPainel,
pegarMensagemPainel
} from '../systems/registro.js';

import {
salvarConfigXP,
pegarConfigXP
} from '../systems/xp.js';

import { painelPrincipal } from '../panels/painelPrincipal.js';
import { painelXP } from '../panels/painelXP.js';
import { painelRegistro } from '../panels/painelRegistro.js';
import { painelRegistro2 } from "../panels/painelRegistro2.js";
import { painelRegistro3 } from "../panels/painelRegistro3.js";
import { painelTicket } from '../panels/painelTicket.js';
import { painelTicket2 } from "../panels/painelTicket2.js";
import { painelTicket3 } from "../panels/painelTicket3.js";
import { painelStaff } from '../panels/painelStaff.js';
import { painelGeral } from '../panels/painelGeral.js';

import {
executarBotoesXP
} from '../panels/xpButtons.js';

export default {
name: 'interactionCreate',

async execute(interaction, client) {

let ticketConfig = {};

try {
ticketConfig = JSON.parse(
fs.readFileSync(
'./database/ticketConfig.json',
'utf8'
)
);
} catch {
ticketConfig = {};
}

if (
await executarBotoesXP(interaction)
) return

// =========================
// PAINEL TICKET
// =========================
  
  
if (
interaction.isButton() &&
interaction.customId === "ticket_pagina2"
) {
return interaction.update(
painelTicket2()
);
}

if (
interaction.isButton() &&
interaction.customId === "ticket_pagina3"
) {
return interaction.update(
painelTicket3()
);
}

if (
interaction.isButton() &&
interaction.customId === "painel_ticket2"
) {
return interaction.update(
painelTicket2()
);
}

// =========================
//
// TICKET - NAVEGAÇÃO
//
// =========================

if (
interaction.isButton() &&
interaction.customId === "painel_ticket"
) {
return interaction.update(
painelTicket()
);
}

if (
interaction.isButton() &&
interaction.customId === "ticket_pagina2"
) {
return interaction.update(
painelTicket2()
);
}

if (
interaction.isButton() &&
interaction.customId === "ticket_pagina3"
) {
return interaction.update(
painelTicket3()
);
}

if (
interaction.isButton() &&
interaction.customId === "painel_ticket2"
) {
return interaction.update(
painelTicket2()
);
}

// =========================
//
// TICKET - BOTÕES
//
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_categoria"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_categoria_modal")
.setTitle("Categoria dos Tickets");

const input = new TextInputBuilder()
.setCustomId("categoria")
.setLabel("ID da categoria")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "ticket_staff"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_staff_modal")
.setTitle("Cargo Staff");

const input = new TextInputBuilder()
.setCustomId("cargo")
.setLabel("ID do cargo")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "ticket_logs"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_logs_modal")
.setTitle("Canal de Logs");

const input = new TextInputBuilder()
.setCustomId("canal")
.setLabel("ID do canal")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

// =========================
//
// TICKET - CANAL DO PAINEL
//
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_canal"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_canal_modal")
.setTitle("Canal do Painel");

const input = new TextInputBuilder()
.setCustomId("canal")
.setLabel("ID do canal")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

// =========================
// TICKET - TÍTULO
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_titulo"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_titulo_modal")
.setTitle("Título do Ticket");

const input = new TextInputBuilder()
.setCustomId("titulo")
.setLabel("Título")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

// =========================
// TICKET - DESCRIÇÃO
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_descricao"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_descricao_modal")
.setTitle("Descrição");

const input = new TextInputBuilder()
.setCustomId("descricao")
.setLabel("Descrição")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

// =========================
// TICKET - BANNER
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_banner"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_banner_modal")
.setTitle("Banner");

const input = new TextInputBuilder()
.setCustomId("banner")
.setLabel("URL da imagem")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

// =========================
// TICKET - COR
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_cor"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_cor_modal")
.setTitle("Cor");

const input = new TextInputBuilder()
.setCustomId("cor")
.setLabel("Hex (#57F287)")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

// =========================
//
// TICKET - SALVAR CONFIG (PARTE 1)
//
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_categoria_modal"
) {

const categoria =
interaction.fields.getTextInputValue("categoria");

const config =
await pegarConfig() || {};

config.ticketCategoria = categoria;

await salvarConfig(config);

return interaction.reply({
content: "✅ Categoria salva.",
ephemeral: true
});

}

// =========================
//
// TICKET - SALVAR CANAL DO PAINEL
//
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_canal_modal"
) {

const canal =
interaction.fields.getTextInputValue("canal");

const config =
await pegarConfig() || {};

config.ticketCanal = canal;

await salvarConfig(config);

return interaction.reply({
content: "✅ Canal do painel salvo.",
ephemeral: true
});

}
  
if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_staff_modal"
) {

const cargo =
interaction.fields.getTextInputValue("cargo");

const config =
await pegarConfig() || {};

config.ticketStaff = cargo;

await salvarConfig(config);

return interaction.reply({
content: "✅ Cargo da Staff salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_logs_modal"
) {

const canal =
interaction.fields.getTextInputValue("canal");

const config =
await pegarConfig() || {};

config.ticketLogs = canal;

await salvarConfig(config);

return interaction.reply({
content: "✅ Canal de logs salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_titulo_modal"
) {

const titulo =
interaction.fields.getTextInputValue("titulo");

const config =
await pegarConfig() || {};

config.ticketTitulo = titulo;

await salvarConfig(config);

return interaction.reply({
content: "✅ Título salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_descricao_modal"
) {

const descricao =
interaction.fields.getTextInputValue("descricao");

const config =
await pegarConfig() || {};

config.ticketDescricao = descricao;

await salvarConfig(config);

return interaction.reply({
content: "✅ Descrição salva.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_banner_modal"
) {

const banner =
interaction.fields.getTextInputValue("banner");

const config =
await pegarConfig() || {};

config.ticketBanner = banner;

await salvarConfig(config);

return interaction.reply({
content: "✅ Banner salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_cor_modal"
) {

const cor =
interaction.fields.getTextInputValue("cor");

const config =
await pegarConfig() || {};

config.ticketCor = cor;

await salvarConfig(config);

return interaction.reply({
  content: "✅ Cor salva.",
  ephemeral: true
});

}

// =========================
//
// TICKET - BOTÃO
//
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_botao"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_botao_modal")
.setTitle("Nome do Botão");

const input = new TextInputBuilder()
.setCustomId("botao")
.setLabel("Nome do botão")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

// =========================
//
// TICKET - EMOJI
//
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_emoji"
) {

const modal = new ModalBuilder()
.setCustomId("ticket_emoji_modal")
.setTitle("Emoji do Botão");

const input = new TextInputBuilder()
.setCustomId("emoji")
.setLabel("Emoji")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}  

// =========================
//
// TICKET - SALVAR CONFIG (PARTE 2)
//
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_botao_modal"
) {

const botao =
interaction.fields.getTextInputValue("botao");

const config =
await pegarConfig() || {};

config.ticketBotao = botao;

await salvarConfig(config);

return interaction.reply({
content: "✅ Nome do botão salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "ticket_emoji_modal"
) {

const emoji =
interaction.fields.getTextInputValue("emoji");

const config =
await pegarConfig() || {};

config.ticketEmoji = emoji;

await salvarConfig(config);

return interaction.reply({
content: "✅ Emoji salvo.",
ephemeral: true
});

}

// =========================
//
// TICKET - PRÉ-VISUALIZAÇÃO
//
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_preview"
) {

const config = await pegarConfig();

const embed = new EmbedBuilder()
.setColor(config?.ticketCor || "#57F287")
.setTitle(config?.ticketTitulo || "🎫 Abrir Ticket")
.setDescription(
config?.ticketDescricao ||
"Clique no botão abaixo para abrir um ticket."
);

if (config?.ticketBanner) {
embed.setImage(config.ticketBanner);
}

const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("open_ticket")
.setLabel(
config?.ticketBotao || "Abrir Ticket"
)
.setEmoji(
config?.ticketEmoji || "🎫"
)
.setStyle(ButtonStyle.Primary)

);

return interaction.reply({
embeds: [embed],
components: [row],
ephemeral: true
});

}

// =========================
//
// TICKET - ENVIAR PAINEL
//
// =========================

if (
interaction.isButton() &&
interaction.customId === "ticket_enviar"
) {

const config = await pegarConfig();

if (!config?.ticketCanal){
return interaction.reply({
content: "❌ Configure a categoria primeiro.",
ephemeral: true
});
}

const canal =
interaction.guild.channels.cache.get(
config.ticketCanal
);
  
if (!canal) {
return interaction.reply({
content: "❌ Canal não encontrado.",
ephemeral: true
});
}

const embed =
new EmbedBuilder()
.setColor(config.ticketCor || "#57F287")
.setTitle(config.ticketTitulo || "🎫 Abrir Ticket")
.setDescription(
config.ticketDescricao ||
"Clique no botão abaixo para abrir um ticket."
);

if (config.ticketBanner) {
embed.setImage(config.ticketBanner);
}

const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("open_ticket")
.setLabel(
config.ticketBotao || "Abrir Ticket"
)
.setEmoji(
config.ticketEmoji || "🎫"
)
.setStyle(ButtonStyle.Primary)

);

const mensagemId =
config.ticketPainelId;

if (mensagemId) {

try {

const mensagem =
await canal.messages.fetch(mensagemId);

await mensagem.edit({
embeds:[embed],
components:[row]
});

return interaction.reply({
content:"✅ Painel atualizado com sucesso.",
ephemeral:true
});

} catch {}

}

const mensagem =
await canal.send({
embeds:[embed],
components:[row]
});

config.ticketPainelId =
mensagem.id;

await salvarConfig(config);

return interaction.reply({
content:"✅ Painel enviado com sucesso.",
ephemeral:true
});

}
  
// =========================
// PAINEL ADMINISTRATIVO
// =========================

if (
interaction.isButton() &&
interaction.customId === 'painel_xp'
) {
return interaction.update(
painelXP()
);
}

if (
interaction.isButton() &&
interaction.customId === 'painel_principal'
) {
return interaction.update(
painelPrincipal()
);
}

// =========================
// P REGISTRO
// =========================
  
  
if (
interaction.isButton() &&
interaction.customId === "painel_registro"
) {
return interaction.update(
painelRegistro()
);
}

if (
interaction.isButton() &&
interaction.customId === "registro_pagina2"
) {
return interaction.update(
painelRegistro2()
);
}

if (
interaction.isButton() &&
interaction.customId === "registro_pagina3"
) {
return interaction.update(
painelRegistro3()
);
}

if (
interaction.isButton() &&
interaction.customId === "painel_registro2"
) {
return interaction.update(
painelRegistro2()
);
}
  
if (
interaction.isButton() &&
interaction.customId === "registro_cargo"
) {

const modal = new ModalBuilder()
.setCustomId("registro_cargo_modal")
.setTitle("Cargo Registrado");

const input = new TextInputBuilder()
.setCustomId("cargo")
.setLabel("ID do cargo")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

  }

if (
interaction.isButton() &&
interaction.customId === "registro_nao"
) {

const modal = new ModalBuilder()
.setCustomId("registro_nao_modal")
.setTitle("Cargo Não Registrado");

const input = new TextInputBuilder()
.setCustomId("cargo")
.setLabel("ID do cargo")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "registro_canal"
) {

const modal = new ModalBuilder()
.setCustomId("registro_canal_modal")
.setTitle("Canal de Registro");

const input = new TextInputBuilder()
.setCustomId("canal")
.setLabel("ID do canal")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "registro_logs"
) {

const modal = new ModalBuilder()
.setCustomId("registro_logs_modal")
.setTitle("Canal de Logs");

const input = new TextInputBuilder()
.setCustomId("canal")
.setLabel("ID do canal")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "registro_titulo"
) {

const modal = new ModalBuilder()
.setCustomId("registro_titulo_modal")
.setTitle("Título do Painel");

const input = new TextInputBuilder()
.setCustomId("titulo")
.setLabel("Título")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "registro_descricao"
) {

const modal = new ModalBuilder()
.setCustomId("registro_descricao_modal")
.setTitle("Descrição");

const input = new TextInputBuilder()
.setCustomId("descricao")
.setLabel("Descrição")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "registro_banner"
) {

const modal = new ModalBuilder()
.setCustomId("registro_banner_modal")
.setTitle("Banner");

const input = new TextInputBuilder()
.setCustomId("banner")
.setLabel("URL da imagem")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "registro_cor"
) {

const modal = new ModalBuilder()
.setCustomId("registro_cor_modal")
.setTitle("Cor");

const input = new TextInputBuilder()
.setCustomId("cor")
.setLabel("Hex (#57F287)")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

if (
interaction.isButton() &&
interaction.customId === "registro_msg"
) {

const modal = new ModalBuilder()
.setCustomId("registro_msg_modal")
.setTitle("Mensagem de Sucesso");

const input = new TextInputBuilder()
.setCustomId("mensagem")
.setLabel("Mensagem")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);

}

// =========================
// BOTÃO REGISTRAR
// =========================

if (
interaction.isButton() &&
interaction.customId === "registro_botao_registrar"
) {

const modal = new ModalBuilder()
.setCustomId("registro_botao_registrar_modal")
.setTitle("Editar Botão Registrar");

const nome = new TextInputBuilder()
.setCustomId("nome")
.setLabel("Nome do botão")
.setPlaceholder("Registrar")
.setStyle(TextInputStyle.Short)
.setRequired(true);

const emoji = new TextInputBuilder()
.setCustomId("emoji")
.setLabel("Emoji")
.setPlaceholder("📝")
.setStyle(TextInputStyle.Short)
.setRequired(false);

modal.addComponents(
new ActionRowBuilder().addComponents(nome),
new ActionRowBuilder().addComponents(emoji)
);

return interaction.showModal(modal);

}

// =========================
// BOTÃO ATUALIZAR
// =========================

if (
interaction.isButton() &&
interaction.customId === "registro_botao_atualizar"
) {

const modal = new ModalBuilder()
.setCustomId("registro_botao_atualizar_modal")
.setTitle("Editar Botão Atualizar");

const nome = new TextInputBuilder()
.setCustomId("nome")
.setLabel("Nome do botão")
.setPlaceholder("Atualizar Registro")
.setStyle(TextInputStyle.Short)
.setRequired(true);

const emoji = new TextInputBuilder()
.setCustomId("emoji")
.setLabel("Emoji")
.setPlaceholder("🔄")
.setStyle(TextInputStyle.Short)
.setRequired(false);

modal.addComponents(
new ActionRowBuilder().addComponents(nome),
new ActionRowBuilder().addComponents(emoji)
);

return interaction.showModal(modal);

}

// =========================
// SALVAR BOTÃO REGISTRAR
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_botao_registrar_modal"
) {

const config =
await pegarConfig() || {};

config.botaoRegistrar =
interaction.fields.getTextInputValue("nome");

config.emojiRegistrar =
interaction.fields.getTextInputValue("emoji") || "📝";

await salvarConfig(config);

return interaction.reply({
content:"✅ Botão Registrar atualizado com sucesso.",
ephemeral:true
});

}

// =========================
// SALVAR BOTÃO ATUALIZAR
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_botao_atualizar_modal"
) {

const config =
await pegarConfig() || {};

config.botaoAtualizar =
interaction.fields.getTextInputValue("nome");

config.emojiAtualizar =
interaction.fields.getTextInputValue("emoji") || "🔄";

await salvarConfig(config);

return interaction.reply({
content:"✅ Botão Atualizar atualizado com sucesso.",
ephemeral:true
});

  }
  
if (
interaction.isModalSubmit() &&
interaction.customId === "registro_cargo_modal"
) {

const cargo =
interaction.fields.getTextInputValue("cargo");

const config =
await pegarConfig() || {};

config.cargoRegistrado = cargo;

await salvarConfig(config);

return interaction.reply({
content: "✅ Cargo registrado salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_nao_modal"
) {

const cargo =
interaction.fields.getTextInputValue("cargo");

const config =
await pegarConfig() || {};

config.cargoNaoRegistrado = cargo;

await salvarConfig(config);

return interaction.reply({
content: "✅ Cargo não registrado salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_canal_modal"
) {

const canal =
interaction.fields.getTextInputValue("canal");

const config =
await pegarConfig() || {};

config.canalRegistro = canal;

await salvarConfig(config);

return interaction.reply({
content: "✅ Canal de registro salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_logs_modal"
) {

const canal =
interaction.fields.getTextInputValue("canal");

const config =
await pegarConfig() || {};

config.logsRegistro = canal;

await salvarConfig(config);

return interaction.reply({
content: "✅ Canal de logs salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_titulo_modal"
) {

const titulo =
interaction.fields.getTextInputValue("titulo");

const config =
await pegarConfig() || {};

config.tituloRegistro = titulo;

await salvarConfig(config);

return interaction.reply({
content: "✅ Título salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_descricao_modal"
) {

const descricao =
interaction.fields.getTextInputValue("descricao");

const config =
await pegarConfig() || {};

config.descricaoRegistro = descricao;

await salvarConfig(config);

return interaction.reply({
content: "✅ Descrição salva.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_banner_modal"
) {

const banner =
interaction.fields.getTextInputValue("banner");

const config =
await pegarConfig() || {};

config.bannerRegistro = banner;

await salvarConfig(config);

return interaction.reply({
content: "✅ Banner salvo.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_cor_modal"
) {

const cor =
interaction.fields.getTextInputValue("cor");

const config =
await pegarConfig() || {};

config.corRegistro = cor;

await salvarConfig(config);

return interaction.reply({
content: "✅ Cor salva.",
ephemeral: true
});

}

if (
interaction.isModalSubmit() &&
interaction.customId === "registro_msg_modal"
) {

const mensagem =
interaction.fields.getTextInputValue("mensagem");

const config =
await pegarConfig() || {};

config.mensagemRegistro = mensagem;

await salvarConfig(config);

return interaction.reply({
content: "✅ Mensagem salva.",
ephemeral: true
});

}

if (
interaction.isButton() &&
interaction.customId === "registro_preview"
) {

const config = await pegarConfig();

const embed =
new EmbedBuilder()
.setColor(config?.corRegistro || "#57F287")
.setTitle(config?.tituloRegistro || "📋 Registro")
.setDescription(
config?.descricaoRegistro ||
"Clique no botão abaixo para iniciar seu registro."
);

if (config?.bannerRegistro) {
embed.setImage(config.bannerRegistro);
}

const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("registro_criar")
.setLabel(config?.botaoRegistrar || "Registrar")
.setEmoji(config?.emojiRegistrar || "📝")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("registro_atualizar")
.setLabel(config?.botaoAtualizar || "Atualizar Registro")
.setEmoji(config?.emojiAtualizar || "🔄")
.setStyle(ButtonStyle.Primary)

);

return interaction.reply({
embeds: [embed],
components: [row],
ephemeral: true
});

}

if (
interaction.isButton() &&
interaction.customId === "registro_enviar"
) {

const config = await pegarConfig();

if (!config?.canalRegistro) {
return interaction.reply({
content: "❌ Configure o canal de registro primeiro.",
ephemeral: true
});
}

const canal =
interaction.guild.channels.cache.get(
config.canalRegistro
);

if (!canal) {
return interaction.reply({
content: "❌ Canal não encontrado.",
ephemeral: true
});
}

const embed =
new EmbedBuilder()
.setColor(config.corRegistro || "#57F287")
.setTitle(config.tituloRegistro || "📋 Registro")
.setDescription(
config.descricaoRegistro ||
"Clique no botão abaixo para iniciar seu registro."
);

if (config.bannerRegistro) {
embed.setImage(config.bannerRegistro);
}

const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("registro_criar")
.setLabel(
config.botaoRegistrar || "Registrar"
)
.setEmoji(
config.emojiRegistrar || "📝"
)
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("registro_atualizar")
.setLabel(
config.botaoAtualizar || "Atualizar Registro"
)
.setEmoji(
config.emojiAtualizar || "🔄"
)
.setStyle(ButtonStyle.Primary)

);
const mensagemId = await pegarMensagemPainel();

if (mensagemId) {

try {

const mensagem = await canal.messages.fetch(mensagemId);

await mensagem.edit({
embeds: [embed],
components: [row]
});

if (config.logsRegistro) {

const logs =
interaction.guild.channels.cache.get(
config.logsRegistro
);

if (logs) {

await logs.send(
`♻️ ${interaction.user} atualizou o painel de registro.`
).catch(() => {});

}

}

return interaction.reply({
content: "✅ Painel atualizado com sucesso.",
ephemeral: true
});

} catch {}

}

const mensagem = await canal.send({
embeds: [embed],
components: [row]
});

await salvarMensagemPainel(mensagem.id);

if (config.logsRegistro) {

const logs =
interaction.guild.channels.cache.get(
config.logsRegistro
);

if (logs) {

await logs.send(
`📤 ${interaction.user} enviou um novo painel de registro.`
).catch(() => {});

}

}

return interaction.reply({
content: "✅ Painel enviado com sucesso.",
ephemeral: true
});

}
if (
interaction.isButton() &&
interaction.customId === "painel_ticket"
) {
return interaction.update(
painelTicket()
);
}

if (
interaction.isButton() &&
interaction.customId === "painel_staff"
) {
return interaction.update(
painelStaff()
);
}

if (
interaction.isButton() &&
interaction.customId === "painel_geral"
) {
return interaction.update(
painelGeral()
);
}

// =========================
// ABRIR TICKET
// =========================

if (
interaction.isButton() &&
interaction.customId === 'open_ticket'
) {

const modal =
new ModalBuilder()
.setCustomId('ticket_modal')
.setTitle('Abrir Ticket');

const nick =
new TextInputBuilder()
.setCustomId('nick')
.setLabel('Seu Nick')
.setStyle(
TextInputStyle.Short
);

const problema =
new TextInputBuilder()
.setCustomId('problema')
.setLabel('Problema')
.setStyle(
TextInputStyle.Short
);

const descricao =
new TextInputBuilder()
.setCustomId('descricao')
.setLabel('Descrição')
.setStyle(
TextInputStyle.Paragraph
);

modal.addComponents(
new ActionRowBuilder()
.addComponents(nick),

new ActionRowBuilder()
  .addComponents(problema),

new ActionRowBuilder()
  .addComponents(descricao)

);

return interaction.showModal(
modal
);
}

// =========================
// CRIAR TICKET
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId === 'ticket_modal'
) {

const nick =
interaction.fields.getTextInputValue(
'nick'
);

const problema =
interaction.fields.getTextInputValue(
'problema'
);

const descricao =
interaction.fields.getTextInputValue(
'descricao'
);

const config = await pegarConfig();

const channel =
await interaction.guild.channels.create({
name: `ticket-${interaction.user.username}`,

type: ChannelType.GuildText,

parent:
config.ticketCategoria,

  permissionOverwrites: [
    {
      id:
        interaction.guild.id,

      deny: [
        PermissionsBitField.Flags.ViewChannel
      ]
    },

    {
      id:
        interaction.user.id,

      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages
      ]
    },

    {
      id:
config.ticketStaff,

      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages
      ]
    }
  ]
});

const embed =
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'🎫 Novo Ticket'
)
.addFields(
{
name: 'Nick',
value: nick
},
{
name: 'Problema',
value: problema
},
{
name: 'Descrição',
value: descricao
}
);

const row =
new ActionRowBuilder()
.addComponents(

    new ButtonBuilder()
      .setCustomId(
        'claim_ticket'
      )
      .setLabel(
        'Assumir'
      )
      .setStyle(
        ButtonStyle.Success
      ),

    new ButtonBuilder()
      .setCustomId(
        'close_ticket'
      )
      .setLabel(
        'Fechar'
      )
      .setStyle(
        ButtonStyle.Danger
      )
  );

await channel.send({
embeds: [embed],
components: [row]
});

return interaction.reply({
content: `✅ Ticket criado: ${channel}`,
ephemeral: true
});
}

// =========================
// ASSUMIR TICKET
// =========================

if (
interaction.isButton() &&
interaction.customId === 'claim_ticket'
) {

const config = await pegarConfig();

const staffRole =
config.ticketStaff;
  
if (
!interaction.member.roles.cache.has(
staffRole
)
) {
return interaction.reply({
content:
'❌ Apenas a staff pode assumir tickets.',
ephemeral: true
});
}

await interaction.channel.permissionOverwrites.edit(
staffRole,
{
ViewChannel: false
}
);

await interaction.channel.permissionOverwrites.edit(
interaction.user.id,
{
ViewChannel: true,
SendMessages: true
}
);

return interaction.reply({
content: `👮 Ticket assumido por ${interaction.user}`
});
}

// =========================
// FECHAR TICKET
// =========================

if (
interaction.isButton() &&
interaction.customId === 'close_ticket'
) {

const row =
new ActionRowBuilder()
.addComponents(

    new ButtonBuilder()
      .setCustomId(
        'ticket_resolved_yes'
      )
      .setLabel('Sim')
      .setStyle(
        ButtonStyle.Success
      ),

    new ButtonBuilder()
      .setCustomId(
        'ticket_resolved_no'
      )
      .setLabel('Não')
      .setStyle(
        ButtonStyle.Danger
      )
  );

return interaction.reply({
content:
'O ticket foi resolvido?',
components: [row]
});
}

// =========================
// FECHAR COM SUCESSO
// =========================

if (
interaction.isButton() &&
interaction.customId === 'ticket_resolved_yes'
) {

await interaction.reply({
content:
'📋 Gerando transcript e fechando ticket...'
});

setTimeout(() => {
interaction.channel.delete()
.catch(() => {});
}, 3000);

return;
}

// =========================
// FECHAR SEM SUCESSO
// =========================

if (
interaction.isButton() &&
interaction.customId === 'ticket_resolved_no'
) {

await interaction.reply({
content:
'📋 Ticket encerrado.'
});

setTimeout(() => {
interaction.channel.delete()
.catch(() => {});
}, 3000);

return;
}

//
// =========================
// BOTÃO REGISTRAR
// =========================
//

if (
interaction.isButton() &&
interaction.customId ===
'registro_criar'
) {

const registrado =
await estaRegistrado(
interaction.user.id
);

if (registrado) {

return interaction.reply({
content:
'❌ Você já está registrado.',
ephemeral: true
});

}

const modal =
new ModalBuilder()
.setCustomId(
'modal_registro'
)
.setTitle(
'Sistema de Registro'
);

const nome =
new TextInputBuilder()
.setCustomId('nome')
.setLabel('Nome')
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const nick =
new TextInputBuilder()
.setCustomId('nick')
.setLabel('Nick')
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const nascimento =
new TextInputBuilder()
.setCustomId('nascimento')
.setLabel(
'Data de nascimento (DD/MM/AAAA)'
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const sexualidade =
new TextInputBuilder()
.setCustomId('sexualidade')
.setLabel('Sexualidade')
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const plataforma =
new TextInputBuilder()
.setCustomId('plataforma')
.setLabel('Mobile / PC / Ambos')
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(nome),

new ActionRowBuilder()
.addComponents(nick),

new ActionRowBuilder()
.addComponents(nascimento),

new ActionRowBuilder()
.addComponents(sexualidade),

new ActionRowBuilder()
.addComponents(plataforma)
);

return interaction.showModal(
modal
);

}

//
// =========================
// ENVIAR REGISTRO
// =========================
//

if (
interaction.isModalSubmit() &&
interaction.customId ===
'modal_registro'
) {

const nome =
interaction.fields.getTextInputValue('nome');

const nick =
interaction.fields.getTextInputValue('nick');

const nascimento =
interaction.fields.getTextInputValue('nascimento');

const sexualidade =
interaction.fields.getTextInputValue('sexualidade');

const plataforma =
interaction.fields.getTextInputValue('plataforma');

await salvarRegistroPendente(
interaction.user.id,
{
nome,
nick,
nascimento,
sexualidade,
plataforma
}
);

const row =
new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId(
'confirmar_registro'
)
.setLabel(
'☑️ Confirmo que sou humano'
)
.setStyle(
ButtonStyle.Success
)
);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'Confirmar Registro'
)
.setDescription(
'Clique no botão abaixo para finalizar seu registro.'
)
],
components: [row],
ephemeral: true
});

}

//
// =========================
// CONFIRMAR REGISTRO
// =========================
//

if (
interaction.isButton() &&
interaction.customId ===
'confirmar_registro'
) {

const dados =
await pegarRegistroPendente(
interaction.user.id
);

if (!dados) {

return interaction.reply({
content:
'❌ Nenhum registro pendente encontrado.',
ephemeral: true
});

}

const config =
await pegarConfig();

await criarRegistro(
interaction.user.id,
dados
);

await removerRegistroPendente(
interaction.user.id
);

try {

await interaction.member.roles.add(
config.cargoRegistrado
);

await interaction.member.roles.remove(
config.cargoNaoRegistrado
);

} catch {}

try {

await interaction.member.setNickname(
dados.nick
);

} catch {}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'✅ Registro Concluído'
)
.setDescription(
'Seu registro foi concluído com sucesso.'
)
],
ephemeral: true
});

}

//
// =========================
// BOTÃO ATUALIZAR REGISTRO
// =========================
//

if (
interaction.isButton() &&
interaction.customId ===
'registro_atualizar'
) {

const registro =
await pegarRegistro(
interaction.user.id
);

if (!registro) {

return interaction.reply({
content:
'❌ Você ainda não está registrado.',
ephemeral: true
});

}

const modal =
new ModalBuilder()
.setCustomId('modal_atualizar_registro')
.setTitle('Atualizar Registro');

const nick =
new TextInputBuilder()
.setCustomId('nick')
.setLabel('Nick')
.setValue(registro.nick || '')
.setStyle(TextInputStyle.Short)
.setRequired(true);

const plataforma =
new TextInputBuilder()
.setCustomId('plataforma')
.setLabel('Celular / PC / Ambos')
.setValue(registro.plataforma || '')
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(nick),

new ActionRowBuilder()
.addComponents(plataforma)
);

return interaction.showModal(modal);

}


// =========================
//

if (
interaction.isModalSubmit() &&
interaction.customId ===
'modal_atualizar_registro'
) {

const nick =
interaction.fields.getTextInputValue(
'nick'
);

const plataforma =
interaction.fields.getTextInputValue(
'plataforma'
);

await atualizarRegistro(
interaction.user.id,
{
nick,
plataforma
}
);

try {

await interaction.member.setNickname(
nick
);

} catch {}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'✅ Registro Atualizado'
)
.setDescription(
'Suas informações foram atualizadas.'
)
.addFields(
{
name: 'Nick',
value: nick
},
{
name: 'Plataforma',
value: plataforma
}
)
],
ephemeral: true
});

  }

// =========================
// MENU CONFIG XP
// =========================

if (
interaction.isStringSelectMenu() &&
interaction.customId ===
'xp_config_menu'
) {

const escolha =
interaction.values[0];

if (escolha === 'xp_cargo') {

const modal =
new ModalBuilder()
.setCustomId('xp_cargo_modal')
.setTitle('XP por Cargo');

const input =
new TextInputBuilder()
.setCustomId('cargos')
.setLabel('Ex: IDCargo=5, IDCargo2=20')
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(input)
);

return interaction.showModal(modal);

  }

if (escolha === 'xp_level') {

const modal =
new ModalBuilder()
.setCustomId('xp_level_modal')
.setTitle('XP para Level');

const input =
new TextInputBuilder()
.setCustomId('xp')
.setLabel('XP necessário para subir')
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(input)
);

return interaction.showModal(modal);

}

if (escolha === 'cooldown') {

const modal =
new ModalBuilder()
.setCustomId('xp_cooldown_modal')
.setTitle('Cooldown XP');

const input =
new TextInputBuilder()
.setCustomId('cooldown')
.setLabel('Tempo em segundos')
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(input)
);

return interaction.showModal(modal);

}

if (escolha === 'canais') {

const modal =
new ModalBuilder()
.setCustomId('xp_canais_modal')
.setTitle('Canais sem XP');

const input =
new TextInputBuilder()
.setCustomId('canais')
.setLabel('IDs separados por vírgula')
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(input)
);

return interaction.showModal(modal);

}

if (escolha === 'cargos') {

const modal =
new ModalBuilder()
.setCustomId('xp_cargos_modal')
.setTitle('Cargos por Level');

const input =
new TextInputBuilder()
.setCustomId('cargos')
.setLabel('Ex: 1=ID,5=ID,10=ID')
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(input)
);

return interaction.showModal(modal);

}

if (
escolha === 'canal_level'
) {

const modal =
new ModalBuilder()
.setCustomId(
'xp_canal_modal'
)
.setTitle(
'Canal de Level Up'
);

const canal =
new TextInputBuilder()
.setCustomId(
'canal'
)
.setLabel(
'ID do canal'
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(canal)
);

return interaction.showModal(
modal
);

}

if (
escolha === 'msg_level'
) {

const modal =
new ModalBuilder()
.setCustomId(
'xp_msg_level_modal'
)
.setTitle(
'Mensagem de Level'
);

const input =
new TextInputBuilder()
.setCustomId(
'mensagem'
)
.setLabel(
'Use {user} e {level}'
)
.setStyle(
TextInputStyle.Paragraph
)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(input)
);

return interaction.showModal(
modal
);

}

if (
escolha === 'msg_cargo'
) {

const modal =
new ModalBuilder()
.setCustomId(
'xp_msg_cargo_modal'
)
.setTitle(
'Mensagem de Cargo'
);

const input =
new TextInputBuilder()
.setCustomId(
'mensagem'
)
.setLabel(
'Use {user}, {level} e {cargo}'
)
.setStyle(
TextInputStyle.Paragraph
)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(input)
);

return interaction.showModal(
modal
);

}

}
  
// =========================
// SALVAR CARGOS XP
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId ===
'xp_cargos_modal'
) {

const texto =
interaction.fields
.getTextInputValue(
'cargos'
);

const cargos = {};

texto
.split(',')
.forEach(item => {

const [
level,
cargo
] = item.split('=');

cargos[
level.trim()
] = cargo.trim();

});

const config =
await pegarConfigXP() || {};

config.cargos =
cargos;

await salvarConfigXP(config);

return interaction.reply({
content:
'✅ Cargos por level atualizados.',
ephemeral: true
});

}

// =========================
// SALVAR CANAL LEVEL
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId ===
'xp_canal_modal'
) {

const canal =
interaction.fields.getTextInputValue(
'canal'
);

const config =
await pegarConfigXP() || {};

await salvarConfigXP({
...config,
canalLevel: canal
});

return interaction.reply({
content:
'✅ Canal de level configurado.',
ephemeral: true
});

}

// =========================
// SALVAR MENSAGEM LEVEL
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId ===
'xp_msg_level_modal'
) {

const mensagem =
interaction.fields.getTextInputValue(
'mensagem'
);

const config =
await pegarConfigXP() || {};

await salvarConfigXP({
...config,
mensagemLevel: mensagem
});

return interaction.reply({
content:
'✅ Mensagem de level salva.',
ephemeral: true
});

}

// =========================
// SALVAR MENSAGEM CARGO
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId ===
'xp_msg_cargo_modal'
) {

const mensagem =
interaction.fields.getTextInputValue(
'mensagem'
);

const config =
await pegarConfigXP() || {};

await salvarConfigXP({
...config,
mensagemCargo: mensagem
});

return interaction.reply({
content:
'✅ Mensagem de cargo salva.',
ephemeral: true
});

}

//==========================
// SALVAR XP POR LEVEL
//==========================

if (
interaction.isModalSubmit() &&
interaction.customId ===
'xp_level_modal'
) {

const texto =
interaction.fields.getTextInputValue(
'xp'
);

const xpLevels = {};

texto
.split('\n')
.forEach(item => {

const [level, xp] =
item.split('=');

if (!level || !xp) return;

xpLevels[
level.trim()
] = Number(
xp.trim()
);

});

const config =
await pegarConfigXP() || {};

config.xpLevels =
xpLevels;

await salvarConfigXP(config);

return interaction.reply({
content:
'✅ Tabela de XP salva com sucesso.',
ephemeral: true
});

  }

// =========================
// SALVAR COOLDOWN 
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId ===
'xp_cooldown_modal'
) {

const cooldown =
Number(
interaction.fields.getTextInputValue(
'cooldown'
)
);

const config =
await pegarConfigXP() || {};

config.cooldown = cooldown;

await salvarConfigXP(config);

return interaction.reply({
content:
'✅ Cooldown atualizado.',
ephemeral: true
});

}

// =========================
// SALVAR CANAIS SEM XP
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId ===
'xp_canais_modal'
) {

const canais =
interaction.fields
.getTextInputValue(
'canais'
)
.split(',')
.map(id => id.trim());

const config =
await pegarConfigXP() || {};

config.canaisSemXP =
canais;

await salvarConfigXP(config);

return interaction.reply({
content:
'✅ Canais sem XP atualizados.',
ephemeral: true
});

}
  
// =========================
// SALVAR XP POR CARGO
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId ===
'xp_cargo_modal'
) {

const texto =
interaction.fields.getTextInputValue(
'cargos'
);

const xpCargo = {};

texto
.split(',')
.forEach(item => {

const [
cargo,
xp
] = item.split('=');

xpCargo[
cargo.trim()
] = Number(
xp.trim()
);

});

const config =
await pegarConfigXP() || {};

config.xpCargo =
xpCargo;

await salvarConfigXP(config);

return interaction.reply({
content:
'✅ XP por cargo atualizado.',
ephemeral: true
});

}

// =========================
// SLASH COMMANDS
// =========================

if (
interaction.isChatInputCommand() &&
!interaction.guild
) {

return interaction.reply({
content:
'❌ Os comandos só podem ser usados dentro de servidores.',
ephemeral: true
});

}

if (!interaction.isChatInputCommand()) return;

const command =
  client.commands.get(
    interaction.commandName
  );

if (!command) return;

const { cooldowns } = client;

if (!cooldowns.has(command.data.name)) {
  cooldowns.set(
    command.data.name,
    new Collection()
  );
}

const timestamps =
  cooldowns.get(command.data.name);

const cooldownMs =
  (command.cooldown ?? 3) * 1000;

const now = Date.now();

if (
  timestamps.has(
    interaction.user.id
  )
) {

  const expiresAt =
    timestamps.get(
      interaction.user.id
    ) + cooldownMs;

  if (now < expiresAt) {

    const remaining =
      (
        (expiresAt - now) / 1000
      ).toFixed(1);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setDescription(
            `⏳ Aguarde ${remaining}s`
          )
      ],
      ephemeral: true
    });
  }
}

timestamps.set(
  interaction.user.id,
  now
);

setTimeout(
  () =>
    timestamps.delete(
      interaction.user.id
    ),
  cooldownMs
);

try {

  await command.execute(
    interaction,
    client
  );

} catch (err) {

  console.error(err);

  if (
    interaction.replied ||
    interaction.deferred
  ) {

    await interaction.followUp({
      content:
        '❌ Erro ao executar comando.',
      ephemeral: true
    }).catch(() => {});

  } else {

    await interaction.reply({
      content:
        '❌ Erro ao executar comando.',
      ephemeral: true
    }).catch(() => {});
   }
 }

}
};
