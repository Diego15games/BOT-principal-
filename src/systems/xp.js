import { db } from './database.js';

const xpCollection = db.collection('xp');
const configCollection = db.collection('xpConfig');

function validarInteiroNaoNegativo(valor, nome) {
  if (!Number.isSafeInteger(valor) || valor < 0) {
    throw new Error(`${nome} deve ser um inteiro não negativo.`);
  }
}

export async function pegarXP(userId) {
  return await xpCollection.findOne({ userId });
}

export async function adicionarXP(userId, quantidade) {
  validarInteiroNaoNegativo(quantidade, 'A quantidade de XP');
  await xpCollection.updateOne(
    { userId },
    { $inc: { xp: quantidade }, $setOnInsert: { level: 0 } },
    { upsert: true }
  );
}

export async function definirXP(userId, xp) {
  validarInteiroNaoNegativo(xp, 'O XP');
  await xpCollection.updateOne({ userId }, { $set: { xp } }, { upsert: true });
}

export async function removerXP(userId, quantidade) {
  validarInteiroNaoNegativo(quantidade, 'A quantidade de XP');
  await xpCollection.updateOne(
    { userId },
    [{
      $set: {
        xp: {
          $max: [0, { $subtract: [{ $ifNull: ['$xp', 0] }, quantidade] }]
        }
      }
    }],
    { upsert: true }
  );
}

export async function definirLevel(userId, level) {
  validarInteiroNaoNegativo(level, 'O nível');
  await xpCollection.updateOne({ userId }, { $set: { level } }, { upsert: true });
}

export const addXP = adicionarXP;
export const removeXP = removerXP;
export const setLevel = definirLevel;

export async function pegarConfigXP() {
  return await configCollection.findOne({ id: 'xp' });
}

export async function salvarConfigXP(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new Error('Configuração de XP inválida.');
  }
  const config = { ...dados };
  delete config._id;
  await configCollection.updateOne({ id: 'xp' }, { $set: config }, { upsert: true });
}
