import { db } from './database.js';

const collection = db.collection('staff');

collection
  .createIndex({ userId: 1 }, { unique: true })
  .catch(err => console.error('Índice staff:', err.message));

const PADRAO = {
  pontos: 0,
  advertencias: 0,
  tickets: 0,
  historico: []
};

function dataAgora() {
  return new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export async function getStaff(userId) {
  const dados = await collection.findOne({ userId });
  return { ...PADRAO, historico: [], ...dados };
}

export async function addPoints(userId, amount = 1) {
  await collection.updateOne(
    { userId },
    {
      $inc: { pontos: amount },
      $setOnInsert: { advertencias: 0, tickets: 0, historico: [] }
    },
    { upsert: true }
  );

  // Pontos nunca ficam negativos.
  await collection.updateOne(
    { userId, pontos: { $lt: 0 } },
    { $set: { pontos: 0 } }
  );

  return await getStaff(userId);
}

export async function removePoints(userId, amount = 1) {
  return await addPoints(userId, -Math.abs(amount));
}

export async function addWarning(
  userId,
  motivo = 'Não informado',
  staffId = 'Desconhecido'
) {
  await collection.updateOne(
    { userId },
    {
      $inc: { advertencias: 1 },
      $push: {
        historico: { motivo, staffId, data: dataAgora() }
      },
      $setOnInsert: { pontos: 0, tickets: 0 }
    },
    { upsert: true }
  );

  return await getStaff(userId);
}

export async function addTicket(userId) {
  await collection.updateOne(
    { userId },
    {
      $inc: { tickets: 1 },
      $setOnInsert: { pontos: 0, advertencias: 0, historico: [] }
    },
    { upsert: true }
  );

  return await getStaff(userId);
}

export async function removeWarning(userId) {
  const dados = await collection.findOne({ userId });

  if (!dados) return null;

  if (dados.advertencias > 0) {
    await collection.updateOne(
      { userId, advertencias: { $gt: 0 } },
      { $inc: { advertencias: -1 }, $pop: { historico: 1 } }
    );
  }

  return await getStaff(userId);
}
