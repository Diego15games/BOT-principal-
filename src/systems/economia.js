import { db } from './database.js';

const collection = db.collection('economia');
const dailyCollection = db.collection('recompensasDiarias');

collection.createIndex({ userId: 1 }, { unique: true }).catch(err => console.error('Índice economia:', err.message));
dailyCollection.createIndex({ userId: 1 }, { unique: true }).catch(err => console.error('Índice recompensas:', err.message));

export async function getMoney(userId) {
  const user = await collection.findOne({ userId });
  return user?.money || 0;
}
export const getBalance = getMoney;

export async function setMoney(userId, amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Valor inválido');
  await collection.updateOne({ userId }, { $set: { money: amount } }, { upsert: true });
  return amount;
}

export async function addMoney(userId, amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Valor inválido');
  const user = await collection.findOneAndUpdate(
    { userId }, { $inc: { money: amount } },
    { upsert: true, returnDocument: 'after' }
  );
  return user?.money || 0;
}

export async function removeMoney(userId, amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Valor inválido');
  const user = await collection.findOneAndUpdate(
    { userId },
    [{ $set: { money: { $max: [0, { $subtract: [{ $ifNull: ['$money', 0] }, amount] }] } } }],
    { upsert: true, returnDocument: 'after' }
  );
  return user?.money || 0;
}

async function debitarSeTiverSaldo(userId, amount) {
  const res = await collection.updateOne({ userId, money: { $gte: amount } }, { $inc: { money: -amount } });
  return res.modifiedCount === 1;
}

export async function transferMoney(fromId, toId, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) return false;
  if (!(await debitarSeTiverSaldo(fromId, amount))) return false;
  try {
    await addMoney(toId, amount);
  } catch (err) {
    await addMoney(fromId, amount).catch(() => {});
    throw err;
  }
  return true;
}

export async function getRanking() {
  return await collection.find({ money: { $gt: 0 } }).sort({ money: -1 }).limit(10).toArray();
}

export async function claimDaily(userId) {
  const agora = new Date();
  const hoje = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const valor = 100;
  const atual = await dailyCollection.findOne({ userId });
  if (atual?.lastClaim === hoje) return { success: false, remaining: 'amanhã' };
  await dailyCollection.updateOne({ userId }, { $set: { lastClaim: hoje } }, { upsert: true });
  await addMoney(userId, valor);
  return { success: true, amount: valor };
}

export async function criarGranaPendente(userId, valor) {
  const user = await collection.findOneAndUpdate({ userId }, { $inc: { granaPendente: valor } }, { upsert: true, returnDocument: 'after' });
  return user?.granaPendente || valor;
}
export async function pegarGranaPendente(userId) {
  const user = await collection.findOne({ userId });
  return user?.granaPendente || 0;
}
export async function removerGranaPendente(userId) {
  await collection.updateOne({ userId }, { $unset: { granaPendente: '' } });
}
export async function receberGranaPendente(userId) {
  const antes = await collection.findOneAndUpdate(
    { userId, granaPendente: { $gt: 0 } },
    [{ $set: { money: { $add: [{ $ifNull: ['$money', 0] }, '$granaPendente'] } } }, { $unset: 'granaPendente' }],
    { returnDocument: 'before' }
  );
  return antes?.granaPendente || 0;
}
