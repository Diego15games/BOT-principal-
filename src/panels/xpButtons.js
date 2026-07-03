import {
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ActionRowBuilder
} from 'discord.js';

export async function executarBotoesXP(interaction) {

// XP por Cargo
if (interaction.isButton() && interaction.customId === 'xp_cargo') {

const modal = new ModalBuilder()
.setCustomId('xp_cargo_modal')
.setTitle('XP por Cargo');

const input = new TextInputBuilder()
.setCustomId('cargos')
.setLabel('Ex: IDCargo=5, IDCargo2=20')
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

await interaction.showModal(modal);
return true;
}

// XP por Level
if (interaction.isButton() && interaction.customId === 'xp_level') {

const modal = new ModalBuilder()
.setCustomId('xp_level_modal')
.setTitle('XP por Level');

const input = new TextInputBuilder()
.setCustomId('xp')
.setLabel('XP necessário')
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

await interaction.showModal(modal);
return true;
}

// Cooldown
if (interaction.isButton() && interaction.customId === 'xp_cooldown') {

const modal = new ModalBuilder()
.setCustomId('xp_cooldown_modal')
.setTitle('Cooldown XP');

const input = new TextInputBuilder()
.setCustomId('cooldown')
.setLabel('Tempo em segundos')
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

await interaction.showModal(modal);
return true;
}

// Canais sem XP
if (interaction.isButton() && interaction.customId === 'xp_canais') {

const modal = new ModalBuilder()
.setCustomId('xp_canais_modal')
.setTitle('Canais sem XP');

const input = new TextInputBuilder()
.setCustomId('canais')
.setLabel('IDs separados por vírgula')
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

await interaction.showModal(modal);
return true;
}

// Cargos por Level
if (interaction.isButton() && interaction.customId === 'xp_cargos_level') {

const modal = new ModalBuilder()
.setCustomId('xp_cargos_modal')
.setTitle('Cargos por Level');

const input = new TextInputBuilder()
.setCustomId('cargos')
.setLabel('Ex: 1=ID,5=ID,10=ID')
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

await interaction.showModal(modal);
return true;
}

// Canal de Level
if (interaction.isButton() && interaction.customId === 'xp_canal_level') {

const modal = new ModalBuilder()
.setCustomId('xp_canal_modal')
.setTitle('Canal de Level');

const input = new TextInputBuilder()
.setCustomId('canal')
.setLabel('ID do canal')
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

await interaction.showModal(modal);
return true;
}

// Mensagem de Level
if (interaction.isButton() && interaction.customId === 'xp_msg_level') {

const modal = new ModalBuilder()
.setCustomId('xp_msg_level_modal')
.setTitle('Mensagem de Level');

const input = new TextInputBuilder()
.setCustomId('mensagem')
.setLabel('Use {user} e {level}')
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

await interaction.showModal(modal);
return true;
}

// Mensagem de Cargo
if (interaction.isButton() && interaction.customId === 'xp_msg_cargo') {

const modal = new ModalBuilder()
.setCustomId('xp_msg_cargo_modal')
.setTitle('Mensagem de Cargo');

const input = new TextInputBuilder()
.setCustomId('mensagem')
.setLabel('Use {user}, {level} e {cargo}')
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(input)
);

await interaction.showModal(modal);
return true;
}

return false;

}
