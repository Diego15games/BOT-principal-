import { db } from './database.js';

const xpCollection = db.collection('xp');
const configCollection = db.collection('xpConfig');

// =========================
// XP DO USUÁRIO
// =========================

// Busca os dados de XP e Level do usuário
export async function pegarXP(userId) {
  return await xpCollection.findOne({ userId });
}

// Adiciona XP com sistema automático de upsert
export async function adicionarXP(userId, quantidade) {
  await xpCollection.updateOne(
    { userId },
    {
      $inc: { xp: quantidade },
      $setOnInsert: { level: 0 }
    },
    { upsert: true }
  );
}

// Define o XP diretamente para um valor fixo
export async function definirXP(userId, xp) {
  await xpCollection.updateOne(
    { userId },
    { $set: { xp } },
    { upsert: true }
  );
}

// Remove XP garantindo que o total nunca fique abaixo de zero
export async function removerXP(userId, quantidade) {
  const dados = await pegarXP(userId);
  const atual = dados?.xp || 0;
  const novo = Math.max(0, atual - quantidade);

  await xpCollection.updateOne(
    { userId },
    { $set: { xp: novo } },
    { upsert: true }
  );
}

// Define o Level diretamente
export async function definirLevel(userId, level) {
  await xpCollection.updateOne(
    { userId },
    { $set: { level } },
    { upsert: true }
  );
}

// =========================
// CONFIGURAÇÃO DO BOT
// =========================

// Busca as configurações globais de XP do bot
export async function pegarConfigXP() {
  return await configCollection.findOne({ id: 'xp' });
}

// Salva as configurações globais de XP do bot
export async function salvarConfigXP(dados) {
  await configCollection.updateOne(
    { id: 'xp' },
    { $set: dados },
    { upsert: true }
  );
}
