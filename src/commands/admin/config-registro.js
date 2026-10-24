import {
SlashCommandBuilder,
PermissionFlagsBits,
EmbedBuilder,
MessageFlags
} from 'discord.js';

import { salvarConfig } from '../../systems/registro.js';

export default {
data: new SlashCommandBuilder()
.setName('config-registro')
.setDescription('Configurar sistema de registro')
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.addRoleOption(option => option.setName('cargo_registrado').setDescription('Cargo Registrado').setRequired(true))
.addRoleOption(option => option.setName('cargo_nao_registrado').setDescription('Cargo Não Registrado').setRequired(true))
.addChannelOption(option => option.setName('canal').setDescription('Canal do registro').setRequired(true))
.addStringOption(option => option.setName('titulo').setDescription('Título do painel').setRequired(true))
.addStringOption(option => option.setName('descricao').setDescription('Descrição do painel').setRequired(true))
.addStringOption(option => option.setName('cor').setDescription('Cor hexadecimal').setRequired(false))
.addStringOption(option => option.setName('banner').setDescription('URL do banner').setRequired(false))
.addStringOption(option => option.setName('botao_registrar').setDescription('Texto botão registrar').setRequired(false))
.addStringOption(option => option.setName('botao_atualizar').setDescription('Texto botão atualizar').setRequired(false)),
cooldown: 5,
async execute(interaction) {
const cargoRegistrado = interaction.options.getRole('cargo_registrado');
const cargoNaoRegistrado = interaction.options.getRole('cargo_nao_registrado');
const canal = interaction.options.getChannel('canal');
await salvarConfig({
cargoRegistrado: cargoRegistrado.id,
cargoNaoRegistrado: cargoNaoRegistrado.id,
canal: canal.id,
titulo: interaction.options.getString('titulo'),
descricao: interaction.options.getString('descricao'),
cor: interaction.options.getString('cor') || '#5865F2',
banner: interaction.options.getString('banner') || null,
botaoRegistrar: interaction.options.getString('botao_registrar') || '📝 Registrar-se',
botaoAtualizar: interaction.options.getString('botao_atualizar') || '🔄 Atualizar Registro'
});
return interaction.reply({
embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('✅ Registro Configurado').setDescription('Sistema configurado com sucesso.')],
flags: MessageFlags.Ephemeral
});
}
};