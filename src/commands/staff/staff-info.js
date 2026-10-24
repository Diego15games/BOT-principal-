import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } from 'discord.js';
import { obterInfoStaff } from '../../systems/staff.js';
import { pegarXP } from '../../systems/xp.js';

export default {
  data: new SlashCommandBuilder()
    .setName('staff-info')
    .setDescription('Consultar informações da equipe')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName('usuario').setDescription('Membro da equipe').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');

    try {
      const [info, xpInfo] = await Promise.all([
        obterInfoStaff(user.id),
        pegarXP(user.id)
      ]);

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`🛡️ Informações de ${user.username}`)
        .setDescription([
          `Pontos: **${info?.pontos ?? 0}**`,
          `Advertências: **${info?.advertencias ?? 0}**`,
          `Tickets atendidos: **${info?.tickets ?? 0}**`,
          `XP: **${xpInfo?.xp ?? 0}**`,
          `Nível: **${xpInfo?.level ?? 0}**`
        ].join(String.fromCharCode(10));

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao consultar informações da staff:', error);
      const resposta = {
        content: '❌ Não foi possível consultar as informações.',
        flags: MessageFlags.Ephemeral
      };
      if (interaction.replied || interaction.deferred) {
        return interaction.followUp(resposta);
      }
      return interaction.reply(resposta);
    }
  }
};
