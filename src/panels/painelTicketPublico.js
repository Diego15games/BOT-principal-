import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

// Tela de configuração do painel público único (o que os membros veem no canal).
export function painelTicketPublico(config) {
  const embed = new EmbedBuilder()
    .setColor(config?.cor || '#5865F2')
    .setTitle('📢 Painel Público de Tickets')
    .setDescription(
      'É a mensagem única que fica no canal, com um menu com todos os tickets prontos (com cargo staff).'
    )
    .addFields(
      { name: '📢 Canal', value: config?.channelId ? `<#${config.channelId}>` : '*não definido*', inline: true },
      { name: '📋 Texto do menu', value: config?.placeholder || 'Tickets', inline: true },
      { name: '📝 Título', value: String(config?.titulo || '*padrão*').slice(0, 250) },
      { name: '📄 Descrição', value: String(config?.descricao || '*padrão*').slice(0, 300) }
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tpub_canal').setLabel('Canal').setEmoji('📢').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tpub_titulo').setLabel('Título').setEmoji('📝').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tpub_descricao').setLabel('Descrição').setEmoji('📄').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tpub_banner').setLabel('Banner').setEmoji('🖼️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tpub_cor').setLabel('Cor').setEmoji('🎨').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tpub_placeholder').setLabel('Texto do Menu').setEmoji('📋').setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tpub_preview').setLabel('Pré-visualização').setEmoji('👀').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tpub_enviar').setLabel('Enviar Painel').setEmoji('📤').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('painel_ticket').setLabel('Lista de Tickets').setEmoji('📋').setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}
