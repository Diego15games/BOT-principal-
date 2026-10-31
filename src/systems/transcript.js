import { AttachmentBuilder } from 'discord.js';

// Gera o histórico do ticket em HTML e devolve como anexo.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function gerarTranscript(channel, guild = channel.guild) {
  const mensagens = [];
  let before;

  // Busca o histórico em páginas de até 100 mensagens, do mais recente ao mais antigo.
  while (mensagens.length < 5000) {
    const pagina = await channel.messages.fetch({
      limit: 100,
      ...(before ? { before } : {})
    });

    if (!pagina.size) break;

    mensagens.push(...pagina.values());
    before = pagina.last().id;

    if (pagina.size < 100) break;
  }

  const membros = new Map();
  const cargos = new Map();
  const canais = new Map();
  const todosOsTextos = mensagens.map(msg => msg.content || '').join('\n');
  for (const match of todosOsTextos.matchAll(/<@&(\d{17,20})>/g)) {
    const id = match[1];
    if (!cargos.has(id)) {
      const cargo = await guild.roles.fetch(id).catch(() => null);
      cargos.set(id, cargo?.name || 'Cargo desconhecido');
    }
  }
  for (const match of todosOsTextos.matchAll(/<@!?(\d{17,20})>/g)) {
    const id = match[1];
    if (!membros.has(id)) {
      const membro = await guild.members.fetch(id).catch(() => null);
      membros.set(id, membro?.displayName || membro?.user?.username || 'Usuário desconhecido');
    }
  }
  for (const match of todosOsTextos.matchAll(/<#(\d{17,20})>/g)) {
    const id = match[1];
    if (!canais.has(id)) {
      const canalMencionado = await guild.channels.fetch(id).catch(() => null);
      canais.set(id, canalMencionado?.name || 'canal desconhecido');
    }
  }

  mensagens.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const linhas = mensagens.map(msg => {
    const autor = escapeHtml(msg.author?.tag || 'Usuário desconhecido');
    const avatar = msg.author?.displayAvatarURL?.({ extension: 'png', size: 64 }) || '';
    const data = escapeHtml(new Date(msg.createdTimestamp).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'UTC'
    }));
    const textoLegivel = String(msg.content || '')
      .replace(/<@&(\d{17,20})>/g, (_, id) => '@' + (cargos.get(id) || 'Cargo desconhecido'))
      .replace(/<@!?(\d{17,20})>/g, (_, id) => '@' + (membros.get(id) || 'Usuário desconhecido'))
      .replace(/<#(\d{17,20})>/g, (_, id) => '#' + (canais.get(id) || 'canal desconhecido'));
    const conteudo = escapeHtml(textoLegivel).replace(/\n/g, '<br>');
    const anexos = [...msg.attachments.values()].map(anexo =>
      '<p>📎 <a href="' + escapeHtml(anexo.url) + '">' +
      escapeHtml(anexo.name || 'Arquivo anexado') + '</a></p>'
    ).join('');
    const embeds = msg.embeds.map(embed => {
      const titulo = embed.title ? '<strong>' + escapeHtml(embed.title) + '</strong>' : '';
      const descricao = embed.description ? '<p>' + escapeHtml(embed.description) + '</p>' : '';
      return '<div class="embed">' + titulo + descricao + '</div>';
    }).join('');

    return '<article class="message"><img class="avatar" src="' + escapeHtml(avatar) +
      '" alt=""><div class="body"><div class="meta"><strong>' + autor +
      '</strong> <time>' + data + '</time></div><div>' +
      (conteudo || (anexos || embeds ? '' : '<em>Mensagem sem texto</em>')) +
      '</div>' + anexos + embeds + '</div></article>';
  }).join('\n');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Transcript - ${escapeHtml(channel.name)}</title>
<style>
body{font-family:Arial,sans-serif;background:#313338;color:#dbdee1;margin:0;padding:24px}
header{max-width:900px;margin:0 auto 20px;padding:18px;background:#232428;border-radius:10px}
h1{font-size:22px;margin:0 0 8px}.message{display:flex;gap:12px;max-width:900px;margin:10px auto;padding:14px;background:#2b2d31;border-radius:8px;overflow-wrap:anywhere}
.avatar{width:40px;height:40px;border-radius:50%}.body{min-width:0;flex:1}.meta{margin-bottom:6px}.meta time{font-size:12px;color:#949ba4;margin-left:8px}
a{color:#00a8fc}.embed{border-left:4px solid #5865f2;padding:8px 12px;margin-top:8px;background:#232428;border-radius:4px}
</style>
</head>
<body>
<header><h1>Transcript: #${escapeHtml(channel.name)}</h1><div>Mensagens registradas: ${mensagens.length}</div><div>Gerado em: ${escapeHtml(new Date().toLocaleString('pt-BR'))}</div></header>
${linhas}
</body>
</html>`;

  return new AttachmentBuilder(Buffer.from(html, 'utf8'), {
    name: `transcript-${channel.name}.html`
  });
}
