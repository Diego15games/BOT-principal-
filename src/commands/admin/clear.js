import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Apagar mensagens')
    .addIntegerOption(option =>
      option.setName('quantidade').setDescription('Quantidade de mensagens (1 a 100)').setMinValue(1).setMaxValue(100).setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const quantidade = interaction.options.getInteger('quantidade');
    if (quantidade < 1 || quantidade > 100) {
      return interaction.reply({ content: '❌ Escolha um valor entre 1 e 100.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const apagadas = await interaction.channel.bulkDelete(quantidade, true);
      await interaction.editReply({ content: `✅ ${apagadas.size} mensagens apagadas.` });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: '❌ Não consegui apagar as mensagens (verifique minhas permissões no canal).' });
    }
  }
};