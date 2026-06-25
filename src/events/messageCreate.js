import {
pegarConfigXP,
adicionarXP,
pegarXP
} from '../systems/xp.js';

export default {
name: 'messageCreate',

async execute(message) {

if (message.author.bot) return;

// comando ping

if (
message.content.toLowerCase() === 'ping'
) {
await message.reply('🏓 Pong!');
}

// sistema xp

const config =
await pegarConfigXP();

if (!config) return;

if (
config.canaisBloqueados?.includes(
message.channel.id
)
) return;

if (!global.xpCooldown)
global.xpCooldown = new Map();

const ultimoXP =
global.xpCooldown.get(
message.author.id
);

if (
ultimoXP &&
Date.now() - ultimoXP <
((config.cooldown || 60) * 1000)
) {
return;
}

global.xpCooldown.set(
message.author.id,
Date.now()
);

const xpGanho =
config.xpPorMensagem || 5;

const dadosAntes =
await pegarXP(
message.author.id
);

const xpAntes =
dadosAntes?.xp || 0;

await adicionarXP(
message.author.id,
xpGanho
);

const dadosDepois =
await pegarXP(
message.author.id
);

const xpDepois =
dadosDepois?.xp || 0;

const xpLevel =
config.xpLevel || 100;

const levelAntes =
Math.floor(
xpAntes / xpLevel
);

const levelDepois =
Math.floor(
xpDepois / xpLevel
);

if (
levelDepois > levelAntes
) {

await message.channel.send({
content:
"🎉 ${message.author} subiu para o nível ${levelDepois}!"
});

}

}
};
