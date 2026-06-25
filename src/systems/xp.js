import { db } from './database.js';

const xp = db.collection('xp');
const config = db.collection('xpConfig');

export async function pegarXP(userId) {

return await xp.findOne({
userId
});

}

export async function adicionarXP(
userId,
quantidade
) {

await xp.updateOne(
{
userId
},
{
$inc: {
xp: quantidade
}
},
{
$setOnInsert: {
level: 0
}
},
{
upsert: true
}
);

}

export async function definirLevel(
userId,
level
) {

await xp.updateOne(
{
userId
},
{
$set: {
level
}
}
);

}

export async function salvarConfigXP(
dados
) {

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

export async function pegarConfigXP() {

return await config.findOne({
id: 'xp'
});

  }
