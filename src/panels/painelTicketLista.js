import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} from 'discord.js';

// Tela inicial dos tickets no /painel: lista os tickets criados,
// permite editar um deles ou criar um novo.
export function painelTicketLista(tipos = []) {
  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('🎫 Sistema de Tickets')
    .setDescription(
      tipos.length
        ? 'Escolha um ticket no menu para **editar**, crie um novo ou configure o **Painel Público** (a mensagem única com o menu de tickets).'
        : 'Nenhum ticket criado ainda. Clique em **Novo Ticket** para começar.'
    );

  for (const tipo of tipos.slice(0, 25)) {
    const faltando = [];
    if (!tipo.panelChannelId) faltando.push('canal do painel');
    if (!tipo.staffRoleId) faltando.push('cargo staff');

    embed.addFields({
      name: String(tipo.nome).slice(0, 250),
      value: [
        `📢 Painel: ${tipo.panelChannelId ? `<#${tipo.panelChannelId}>` : '*não definido*'}`,
        `📂 Categoria: ${tipo.categoryId ? `<#${tipo.categoryId}>` : '*não definida*'}`,
        faltando.length
          ? `⚠️ Falta: ${faltando.join(' e ')}`
          : '✅ Pronto para enviar'
      ].join('\n'),
      inline: true
    });
  }

  const components = [];

  if (tipos.length) {
    components.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_editar_menu')
          .setPlaceholder('✏️ Editar um ticket')
          .addOptions(
            tipos.slice(0, 25).map(tipo => ({
              label: String(tipo.nome).slice(0, 100),
              value: tipo.tipoId
            }))
          )
      )
    );
  }

  components.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_novo')
        .setLabel('Novo Ticket')
        .setEmoji('➕')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('ticket_painel_publico')
        .setLabel('Painel Público')
        .setEmoji('📢')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('painel_principal')
        .setLabel('🏠 Painel Principal')
        .setStyle(ButtonStyle.Danger)
    )
  );

  return { embeds: [embed], components };
}
