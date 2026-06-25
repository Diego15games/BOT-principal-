import {
pegarConfigXP,
pegarXP,
adicionarXP,
definirLevel
} from '../systems/xp.js';

const cooldown = new Map();

export default {
name: 'messageCreate',

async execute(message) {

if (message.author.bot) return;

const config =
await pegarConfigXP();

if (!config) return;

// canais sem xp

if (
config.canaisSemXP?.includes(
message.channel.id
)
) return;

// cooldown

const tempo =
config.esfriar || 60;

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

const xpGanho =
config.xpPorMensagem || 5;

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

const xpLevel =
config.xpPorLevel || 100;

const level =
Math.floor(
xp / xpLevel
);

const levelAtual =
dados?.level || 0;

if (level > levelAtual) {

await definirLevel(
message.author.id,
level
);

await message.channel.send(
`🎉 ${message.author}, você subiu para o nível ${level}!`
).catch(() => {});

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

}

}

}

}

}

};
