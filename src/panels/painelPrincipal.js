import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from 'discord.js';

export function painelPrincipal() {

const embed =
new EmbedBuilder()
.setColor('#5865F2')
.setTitle('⚙️ XT BOT')
.setDescription(
'### Painel Administrativo\n\nEscolha um sistema para configurar.'
);

const row1 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('painel_xp')
.setLabel('Sistema XP')
.setEmoji('⭐')
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId('painel_registro')
.setLabel('Registro')
.setEmoji('📝')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId('painel_ticket')
.setLabel('Tickets')
.setEmoji('🎫')
.setStyle(ButtonStyle.Secondary)

);

const row2 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('painel_staff')
.setLabel('Staff')
.setEmoji('🛡️')
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId('painel_geral')
.setLabel('Geral')
.setEmoji('⚙️')
.setStyle(ButtonStyle.Secondary)

);

return {

embeds:[embed],

components:[
row1,
row2
]

};

}
