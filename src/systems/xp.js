import { db } from './database.js';

const xpCollection = db.collection('xp');
const configCollection = db.collection('xpConfig');

export async function pegarXP(userId) {
  return await xpCollection.findOne({ userId });
}
export async function adicionarXP(userId, quantidade) {
  await xpCollection.updateOne({ userId }, { $inc: { xp: quantidade }, $setOnInsert: { level: 0 } }, { upsert: true });
}
export async function definirXP(userId, xp) {
  await xpCollection.updateOne({ userId }, { $set: { xp } }, { upsert: true });
}
export async function removerXP(userId, quantidade) {
  const dados = await pegarXP(userId);
  const atual = dados?.xp || 0;
  await xpCollection.updateOne({ userId }, { $set: { xp: Math.max(0, atual - quantidade) } }, { upsert: true });
}
export async function definirLevel(userId, level) {
  await xpCollection.updateOne({ userId }, { $set: { level } }, { upsert: true });
}
export const addXP = adicionarXP;
export const removeXP = removerXP;
export const setLevel = definirLevel;
export async function pegarConfigXP() {
  return await configCollection.findOne({ id: 'xp' });
}
export async function salvarConfigXP(dados) {
  await configCollection.updateOne({ id: 'xp' }, { $set: dados }, { upsert: true });
}
