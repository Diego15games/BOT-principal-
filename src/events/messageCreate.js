import {
pegarConfigXP,
pegarXP,
adicionarXP,
definirLevel
} from '../systems/xp.js';

import { pegarConfigTickets } from '../systems/tickets.js';

const cooldown = new Map();

// Cache curto da config de XP: evita uma consulta ao Mongo
// em TODA mensagem enviada no servidor.
const CACHE_MS = 15 * 1000;
let cacheConfig = { em: 0, dados: null };

async function getConfigXP() {
  if (Date.now() - cacheConfig.em < CACHE_MS) {
    return cacheConfig.dados;
  }

  cacheConfig = { em: Date.now(), dados: await pegarConfigXP() };

  return cacheConfig.dados;
}

// Limpa cooldowns vencidos (antes o Map crescia para sempre).
setInterval(() => {
  const agora = Date.now();

  for (const [id, ultimo] of cooldown) {
    if (agora - ultimo > 10 * 60 * 1000) cooldown.delete(id);
  }
}, 10 * 60 * 1000).unref();

export default {
name: 'messageCreate',

async execute(message) {

if (message.author.bot) return;

if (!message.guild || !message.member) return;

// Registrar mensagens enviadas dentro dos tickets no canal de logs.
if (message.channel.topic?.startsWith('ticket:')) {
  try {
    const configTicket = await pegarConfigTickets(message.guild.id);
    const logChannel = configTicket?.logChannelId
      ? await message.guild.channels.fetch(configTicket.logChannelId).catch(() => null)
      : null;

    if (logChannel?.isTextBased()) {
      const texto = message.content?.trim() || '(mensagem sem texto)';
      const anexos = [...message.attachments.values()]
        .map(arquivo => `[Anexo: ${arquivo.name || 'arquivo'}] ${arquivo.url}`)
        .join('\n');
      const trecho = `💬 **Mensagem em ticket** | ${message.channel}\n**Autor:** ${message.author.tag} (${message.author.id})\n**Mensagem:** ${texto}${anexos ? `\n${anexos}` : ''}`;

      await logChannel.send({
        content: trecho.slice(0, 1900),
        allowedMentions: { parse: [] }
      }).catch(erro => console.error('Erro ao registrar mensagem do ticket:', erro));
    }
  } catch (erro) {
    console.error('Erro no registro de mensagem do ticket:', erro);
  }
}

const config =
await getConfigXP();

if (!config) return;

// canais sem xp

if (
config.canaisSemXP?.includes(
message.channel.id
)
) return;

// cooldown separado por servidor e usuário

const tempo =
config.cooldown || 60;
const cooldownKey = `${message.guild.id}:${message.author.id}`;

if (
cooldown.has(cooldownKey)
) {

const ultimo =
cooldown.get(
cooldownKey
);

if (
Date.now() - ultimo <
tempo * 1000
) {
return;
}

}

cooldown.set(
cooldownKey,
Date.now()
);

// xp por mensagem

let xpGanho = 0;

if (config.xpCargo) {

const cargos = message.member.roles.cache
.sort((a, b) => b.position - a.position);

for (const cargo of cargos.values()) {

if (
config.xpCargo[cargo.id]
) {

xpGanho =
config.xpCargo[cargo.id];

break;

}

}

}

if (xpGanho <= 0) return;

await adicionarXP(
message.author.id,
xpGanho
);

const dados =
await pegarXP(
message.author.id
);

const xp =
dados?.xp || 0;

const levelAtual =
dados?.level || 0;

let level = 0;

const tabela =
config.xpLevels || {};

const niveis =
Object.keys(tabela)
.sort((a, b) => Number(a) - Number(b));

for (const lvl of niveis) {

if (xp >= tabela[lvl]) {

level = Number(lvl);

} else {

break;

}

}

if (level > levelAtual) {

await definirLevel(
message.author.id,
level
);

const canal =
message.guild.channels.cache.get(
config.canalLevel
);

if (canal) {

const msg =
(config.mensagemLevel ||
'🎉 {user} subiu para o nível {level}!')

.replace('{user}', `${message.author}`)
.replace('{level}', level)
.replace('{xp}', xp);

await canal.send(msg)
.catch(() => {});

}

}

// cargos por level

if (config.cargos) {

for (const lvl in config.cargos) {

if (level >= Number(lvl)) {

const cargoId =
config.cargos[lvl];

const cargo =
message.guild.roles.cache.get(
cargoId
);

if (
cargo &&
!message.member.roles.cache.has(
cargoId
)
) {

await message.member.roles.add(
cargo
).catch(() => {});

const canal =
message.guild.channels.cache.get(
config.canalLevel
);

if (canal) {

const msgCargo =
(config.mensagemCargo ||
'🏆 {user} recebeu {cargo}!')

.replace('{user}', `${message.author}`)
.replace('{cargo}', `${cargo}`)
.replace('{level}', level)
.replace('{xp}', xp);

await canal.send(
msgCargo
).catch(() => {});

}

  }

}

}

}

}

};

