import {
pegarConfigXP,
pegarXP,
adicionarXP,
definirLevel
} from '../systems/xp.js';

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

const config =
await getConfigXP();

if (!config) return;

// canais sem xp

if (
config.canaisSemXP?.includes(
message.channel.id
)
) return;

// cooldown

const tempo =
config.cooldown || 60;

if (
cooldown.has(message.author.id)
) {

const ultimo =
cooldown.get(
message.author.id
);

if (
Date.now() - ultimo <
tempo * 1000
) {
return;
}

}

cooldown.set(
message.author.id,
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

