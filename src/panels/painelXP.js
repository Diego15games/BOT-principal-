import {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} from 'discord.js';

export function painelXP() {

const embed =
new EmbedBuilder()
.setColor('#FFD700')
.setTitle('⭐ Sistema de XP')
.setDescription(
'Configure todo o sistema de XP através dos botões abaixo.'
);

const row1 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('xp_cargo')
.setLabel('XP por Cargo')
.setEmoji('💎')
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId('xp_level')
.setLabel('XP por Level')
.setEmoji('⭐')
.setStyle(ButtonStyle.Success)

);

const row2 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('xp_cooldown')
.setLabel('Cooldown')
.setEmoji('⏱️')
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId('xp_canais')
.setLabel('Canais sem XP')
.setEmoji('📁')
.setStyle(ButtonStyle.Secondary)

);

const row3 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('xp_cargos_level')
.setLabel('Cargos por Level')
.setEmoji('🏅')
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId('xp_canal_level')
.setLabel('Canal de Level')
.setEmoji('📢')
.setStyle(ButtonStyle.Secondary)

);

const row4 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('xp_msg_level')
.setLabel('Mensagem Level')
.setEmoji('💬')
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId('xp_msg_cargo')
.setLabel('Mensagem Cargo')
.setEmoji('🎉')
.setStyle(ButtonStyle.Secondary)

);

const row5 =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('painel_principal')
.setLabel('Voltar')
.setEmoji('⬅️')
.setStyle(ButtonStyle.Danger)

);

return {

embeds: [embed],

components: [
row1,
row2,
row3,
row4,
row5
]

};

}
