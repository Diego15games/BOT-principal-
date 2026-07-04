import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from "discord.js";

export function painelStaff(){

const embed=new EmbedBuilder()
.setColor("#ED4245")
.setTitle("🛡️ Sistema Staff")
.setDescription("Configure a Staff.");

const row1=new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("staff_mod")
.setLabel("Moderador")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("staff_admin")
.setLabel("Administrador")
.setStyle(ButtonStyle.Success)

);

const row2=new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("staff_logs")
.setLabel("Logs")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("staff_dono")
.setLabel("Fundador")
.setStyle(ButtonStyle.Danger)

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
