import { AttachmentBuilder } from 'discord.js';

const LIMITE_MENSAGENS = 1000;

function formatarData(date) {
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
}

// Busca o histórico do canal (mais antigo → mais novo) e devolve
// um anexo .txt pronto para enviar. Retorna null se não houver mensagens.
export async function gerarTranscript(channel) {
  const todas = [];
  let antes;

  while (todas.length < LIMITE_MENSAGENS) {
    const lote = await channel.messages.fetch({
      limit: 100,
      ...(antes && { before: antes })
    });

    if (!lote.size) break;

    todas.push(...lote.values());
    antes = lote.last().id;
  }

  if (!todas.length) return null;

  todas.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const linhas = todas.map(msg => {
    const autor = `${msg.author.tag} (${msg.author.id})`;
    let texto = msg.content || '';

    if (msg.attachments.size) {
      texto += `\n[Anexos: ${msg.attachments.map(a => a.url).join(', ')}]`;
    }

    if (msg.embeds.length && !texto) {
      texto = '[Embed]';
    }

    return `[${formatarData(msg.createdAt)}] ${autor}: ${texto}`;
  });

  const cabecalho =
    `Transcript do canal #${channel.name} (${channel.id})\n` +
    `Gerado em ${formatarData(new Date())}\n` +
    `Mensagens: ${todas.length}\n` +
    `${'='.repeat(40)}\n\n`;

  return new AttachmentBuilder(
    Buffer.from(cabecalho + linhas.join('\n'), 'utf8'),
    { name: `transcript-${channel.name}.txt` }
  );
}
