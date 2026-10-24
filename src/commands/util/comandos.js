import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('comandos').setDescription('Listar comandos disponíveis'),
  async execute(interaction) {
    const comandos = interaction.client.commands;
    const linhas = comandos
      ? [...comandos.values()].map(cmd => `/${cmd.data.name} - ${cmd.data.description || 'Sem descrição'}`).sort()
      : [];
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📚 Comandos disponíveis')
      .setDescription(linhas.length ? linhas.join('\n').slice(0, 4000) : 'Nenhum comando carregado.');
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};