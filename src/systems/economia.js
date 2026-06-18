import { db } from './database.js';

const collection =
db.collection('economia');

export async function getMoney(
userId
) {

const user =
await collection.findOne({
userId
});

return user?.money || 0;

}

export async function addMoney(
userId,
amount
) {

await collection.updateOne(
{ userId },
{
$inc: {
money: amount
}
},
{
upsert: true
}
);

const user =
await collection.findOne({
userId
});

return user?.money || 0;

}

export async function removeMoney(
userId,
amount
) {

const saldo =
await getMoney(
userId
);

const novoSaldo =
Math.max(
0,
saldo - amount
);

await collection.updateOne(
{ userId },
{
$set: {
money: novoSaldo
}
},
{
upsert: true
}
);

return novoSaldo;

}

export async function transferMoney(
fromId,
toId,
amount
) {

const saldo =
await getMoney(
fromId
);

if (saldo < amount) {
return false;
}

await removeMoney(
fromId,
amount
);

await addMoney(
toId,
amount
);

return true;

}

export async function getRanking() {

return await collection
.find()
.sort({
money: -1
})
.limit(10)
.toArray();

}

export async function criarGranaPendente(
userId,
valor
) {

await collection.updateOne(
{ userId },
{
$set: {
granaPendente: valor
}
},
{
upsert: true
}
);

}

export async function pegarGranaPendente(
userId
) {

const user =
await collection.findOne({
userId
});

return user?.granaPendente || 0;

}

export async function removerGranaPendente(
userId
) {

await collection.updateOne(
{ userId },
{
$unset: {
granaPendente: ''
}
}
);

}

export async function setMoney(
userId,
valor
) {

await collection.updateOne(
{ userId },
{
$set: {
money: valor
}
},
{
upsert: true
}
);

return valor;

}
