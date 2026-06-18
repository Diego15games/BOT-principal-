import { db } from './database.js';

const collection =
db.collection('economia');

export async function getMoney(userId) {

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

return user.money;

}

export async function removeMoney(
userId,
amount
) {

const saldo =
await getMoney(userId);

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
await getMoney(fromId);

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

export async function claimDaily(
userId
) {

const user =
await collection.findOne({
userId
});

const now =
Date.now();

const cooldown =
24 * 60 * 60 * 1000;

if (
user?.lastDaily &&
now - user.lastDaily <
cooldown
) {
return false;
}

await collection.updateOne(
{ userId },
{
$set: {
lastDaily: now
},
$inc: {
money: 1000
}
},
{
upsert: true
}
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
