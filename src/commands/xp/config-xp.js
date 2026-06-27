import {
SlashCommandBuilder,
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder
} from 'discord.js';

export default {

data:
new SlashCommandBuilder()

.setName('config-xp')

.setDescription(
'Painel do sistema XP'
),

async execute(interaction) {

const embed =
new EmbedBuilder()

.setColor(0x5865F2)

.setTitle('⚙️ Configuração XP')

.setDescription(
'Escolha uma opção abaixo.'
);

const menu =
new StringSelectMenuBuilder()

.setCustomId('xp_config_menu')

.setPlaceholder(
'Selecione'
)

.addOptions([
{
label: 'XP por Cargo',
value: 'xp_cargo',
description: 'Definir XP por cargo'
},
{
label: 'XP para level',
value: 'xp_level'
},
{
label: 'Cooldown',
value: 'cooldown'
},
{
label: 'Canais sem XP',
value: 'canais'
},
{
label: 'Cargos por level',
value: 'cargos'
},
{
label: 'Canal de Level Up',
value: 'canal_level'
},
{
label: 'Mensagem de Level',
value: 'msg_level'
},
{
label: 'Mensagem de Cargo',
value: 'msg_cargo'
}
]);

const row =
new ActionRowBuilder()
.addComponents(menu);

await interaction.reply({
embeds: [embed],
components: [row]
});

}

};
