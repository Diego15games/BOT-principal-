import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Trancar canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    try {
      if (!interaction.channel || !interaction.guild) {
        return interaction.reply({
          content: '❌ Este comando só pode ser usado em um canal do servidor.',
          flags: MessageFlags.Ephemeral
        });
      }

      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: false }
      );

      return interaction.reply({ content: '🔒 Canal trancado com sucesso.' });
    } catch (error) {
      console.error('Erro ao trancar canal:', error);
      const resposta = {
        content: '❌ Não consegui trancar este canal. Verifique minhas permissões.',
        flags: MessageFlags.Ephemeral
      };
      if (interaction.replied || interaction.deferred) {
        return interaction.followUp(resposta);
      }
      return interaction.reply(resposta);
    }
  }
};
