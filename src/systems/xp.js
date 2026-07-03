import { db } from './database.js';

const xpCollection = db.collection('xp');
const config = db.collection('xpConfig');

// =========================
// XP DO USUÁRIO
// =========================

export async function pegarXP(userId) {

return await xp.findOne({ userId });

}

export async function adicionarXP(userId, quantidade) {

await xp.updateOne(
{ userId },
{
$inc: { xp: quantidade },
$setOnInsert: {
level: 0
}
},
{
upsert: true
}
);

}

export async function definirLevel(userId, level) {

await xp.updateOne(
{ userId },
{
$set: { level }
}
);

}

// =========================
// CONFIGURAÇÃO
// =========================

export async function pegarConfigXP() {

return await config.findOne({
id: 'xp'
});

}

export async function salvarConfigXP(dados) {

await config.updateOne(
{
id: 'xp'
},
{
$set: dados
},
{
upsert: true
}
);

}

export async function definirXP(userId, xp) {

await xpCollection.updateOne(
{ userId },
{
$set: { xp }
},
{
upsert: true
}
);

}

export async function removerXP(userId, quantidade) {

const dados = await pegarXP(userId);

const atual = dados?.xp || 0;

const novo = Math.max(0, atual - quantidade);

await xpCollection.updateOne(
{ userId },
{
$set: { xp: novo }
},
{
upsert: true
}
);

}

export async function adicionarXPManual(userId, quantidade) {

await xpCollection.updateOne(
{ userId },
{
$inc: { xp: quantidade }
},
{
upsert: true
}
);

}

export async function definirNivel(userId, nivel) {

await xpCollection.updateOne(
{ userId },
{
$set: { level: nivel }
},
{
upsert: true
}
);

  }
