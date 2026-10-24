import { db } from './database.js';

const xpCollection = db.collection('xp');
const configCollection = db.collection('xpConfig');

function validarInteiro(valor, nome, minimo = 0) {
  if (!Number.isSafeInteger(valor) || valor < minimo) {
    throw new Error(`${nome} inválido`);
  }
}

export async function pegarXP(userId) {
  return await xpCollection.findOne({ userId });
}
export async function adicionarXP(userId, quantidade) {
  validarInteiro(quantidade, 'Quantidade de XP', 1);
  await xpCollection.updateOne({ userId }, { $inc: { xp: quantidade }, $setOnInsert: { level: 0 } }, { upsert: true });
}
export async function definirXP(userId, xp) {
  validarInteiro(xp, 'XP');
  await xpCollection.updateOne({ userId }, { $set: { xp } }, { upsert: true });
}
export async function removerXP(userId, quantidade) {
  validarInteiro(quantidade, 'Quantidade de XP', 1);
  await xpCollection.updateOne(
    { userId },
    [{ $set: { xp: { $max: [0, { $subtract: [{ $ifNull: ['$xp', 0] }, quantidade] }] } } }],
    { upsert: true }
  );
}
export async function definirLevel(userId, level) {
  validarInteiro(level, 'Nível');
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
