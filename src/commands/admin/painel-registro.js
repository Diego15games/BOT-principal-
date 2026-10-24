import {
SlashCommandBuilder,
PermissionFlagsBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
MessageFlags
} from 'discord.js';

import { pegarConfig } from '../../systems/registro.js';

export default {
data: new SlashCommandBuilder()
.setName('painel-registro')
.setDescription('Enviar painel de registro')
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
cooldown: 5,
async execute(interaction) {
const config = await pegarConfig();
if (!config) {
return interaction.reply({ content: '❌ Configure primeiro usando /config-registro', flags: MessageFlags.Ephemeral });
}
const canal = interaction.guild.channels.cache.get(config.canal);
if (!canal) {
return interaction.reply({ content: '❌ Canal configurado não encontrado.', flags: MessageFlags.Ephemeral });
}
const embed = new EmbedBuilder().setColor(config.cor || '#5865F2').setTitle(config.titulo).setDescription(config.descricao);
if (config.banner) embed.setImage(config.banner);
const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('registro_criar').setLabel(config.botaoRegistrar).setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId('registro_atualizar').setLabel(config.botaoAtualizar).setStyle(ButtonStyle.Primary)
);
await canal.send({ embeds: [embed], components: [row] });
return interaction.reply({ content: '✅ Painel enviado.', flags: MessageFlags.Ephemeral });
}
};