import {
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ActionRowBuilder
} from 'discord.js';

export async function executarBotoesXP(interaction) {

// =========================
// XP POR CARGO
// =========================

if (
interaction.isButton() &&
interaction.customId === 'xp_cargo'
) {

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

await interaction.showModal(modal);

return true;

}

// =========================
// XP POR LEVEL
// =========================

if (
interaction.isButton() &&
interaction.customId === 'xp_level'
) {

const modal =
new ModalBuilder()
.setCustomId('xp_level_modal')
.setTitle('XP por Level');

const input =
new TextInputBuilder()
.setCustomId('xp')
.setLabel('XP necessário')
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(input)
);

await interaction.showModal(modal);

return true;

}

// =========================
// COOLDOWN
// =========================

if (
interaction.isButton() &&
interaction.customId === 'xp_cooldown'
) {

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

await interaction.showModal(modal);

return true;

}

// =========================
// CANAIS SEM XP
// =========================

if (
interaction.isButton() &&
interaction.customId === 'xp_canais'
) {

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

await interaction.showModal(modal);

return true;

}

return false;

}
