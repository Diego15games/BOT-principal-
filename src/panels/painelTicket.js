import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from 'discord.js';

export function painelTicket() {
const embed = new EmbedBuilder()
.setColor(0x57F287)
.setTitle('🎫 Central de Atendimento')
.setDescription(
'Precisa de ajuda? Clique no botão abaixo para abrir um ticket.\n\n' +
'Nossa equipe atenderá você assim que possível.\n\n' +
'Use o ticket apenas para assuntos que precisam da equipe.'
)
.setFooter({ text: 'MODS-GTAS • Sistema de Suporte' });

const botoes = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId('ticket_abrir')
.setLabel('Abrir Ticket')
.setEmoji('🎫')
.setStyle(ButtonStyle.Success)
);

return {
embeds: [embed],
components: [botoes]
};
}
