import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

import {
  pegarRegistroTicket,
  contarSeguintes,
  formatarNumero
} from '../../systems/ticketRegistro.js';

export default {
  data: new SlashCommandBuilder()
    .setName('apagar-ticket')
    .setDescription('Apaga o ticket de um número e renumera os seguintes')
    .addIntegerOption(option =>
      option
        .setName('numero')
        .setDescription('Número do ticket (ex.: 4)')
        .setMinValue(1)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const privado = { flags: MessageFlags.Ephemeral };
    const numero = interaction.options.getInteger('numero');
    const registro = await pegarRegistroTicket(interaction.guildId, numero);

    if (!registro) {
      return interaction.reply({
        content: `❌ Não existe o ticket #${formatarNumero(numero)}.`,
        ...privado
      });
    }

    const aindaAberto =
      registro.aberto &&
      registro.channelId &&
      interaction.guild.channels.cache.has(registro.channelId);

    if (aindaAberto) {
      return interaction.reply({
        content: `❌ O ticket #${formatarNumero(numero)} ainda está aberto (<#${registro.channelId}>). Feche ele antes de apagar o número.`,
        ...privado
      });
    }

    const seguintes = await contarSeguintes(interaction.guildId, numero);

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle(`🗑️ Apagar o ticket #${formatarNumero(numero)}?`)
      .setDescription(
        `O registro do ticket #${formatarNumero(numero)} será apagado e **${seguintes}** ticket(s) depois dele voltam um número ` +
        `(o #${formatarNumero(numero + 1)} vira #${formatarNumero(numero)} e assim por diante), ` +
        'abertos ou fechados. Os canais de tickets abertos serão renomeados.\n\nEssa ação não pode ser desfeita.'
      );

    return interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`tkapagar_ok:${numero}`)
            .setLabel('Sim, apagar')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('tkapagar_cancelar')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary)
        )
      ],
      ...privado
    });
  }
};
