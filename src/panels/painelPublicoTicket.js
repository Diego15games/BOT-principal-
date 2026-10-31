import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from 'discord.js';

const UNICODE = /^\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200d\ufe0f]*$/u;
const CUSTOM = /^<(a?):(\w+):(\d+)>$/;

// Converte o emoji digitado em algo que o menu aceita (ou nada, se inválido).
function emojiDoMenu(valor) {
  const texto = String(valor || '').trim();

  const custom = texto.match(CUSTOM);
  if (custom) {
    return { animated: Boolean(custom[1]), name: custom[2], id: custom[3] };
  }

  return UNICODE.test(texto) ? texto : null;
}

function primeiraLinha(texto) {
  const linha = String(texto || '')
    .split('\n')
    .map(l => l.trim())
    .find(Boolean);

  return linha ? linha.slice(0, 100) : null;
}

// Painel público único: uma embed e um menu com todos os tickets.
export function painelPublicoTicket(config, tipos = []) {
  const embed = new EmbedBuilder()
    .setColor(config?.cor || '#5865F2')
    .setTitle(config?.titulo || '🎫 Central de Tickets')
    .setDescription(
      config?.descricao ||
      'Selecione abaixo o tipo de ticket que você deseja abrir.'
    );

  if (config?.banner) {
    embed.setImage(config.banner);
  }

  if (!tipos.length) {
    return { embeds: [embed], components: [] };
  }

  const opcoes = tipos.slice(0, 25).map(tipo => {
    const opcao = {
      label: String(tipo.botao || tipo.nome).slice(0, 100),
      value: tipo.tipoId
    };

    const descricao = primeiraLinha(tipo.descricao);
    if (descricao) opcao.description = descricao;

    const emoji = emojiDoMenu(tipo.emoji);
    if (emoji) opcao.emoji = emoji;

    return opcao;
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_menu_abrir')
    .setPlaceholder(String(config?.placeholder || 'Tickets').slice(0, 150))
    .addOptions(opcoes);

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(menu)]
  };
}
