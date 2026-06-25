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
label: 'XP por mensagem',
value: 'xp_msg'
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
