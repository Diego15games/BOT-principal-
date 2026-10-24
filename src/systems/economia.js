import { db } from './database.js';

const collection = db.collection('economia');

// Índice único: evita documentos duplicados quando duas operações
// com upsert acontecem ao mesmo tempo para o mesmo usuário.
collection
  .createIndex({ userId: 1 }, { unique: true })
  .catch(err => console.error('Índice economia:', err.message));

export async function getMoney(userId) {
  const user = await collection.findOne({ userId });
  return user?.money || 0;
}

export async function addMoney(userId, amount) {
  const user = await collection.findOneAndUpdate(
    { userId },
    { $inc: { money: amount } },
    { upsert: true, returnDocument: 'after' }
  );

  return user?.money || 0;
}

// Remove dinheiro de forma atômica; o saldo nunca fica abaixo de 0.
// Retorna o novo saldo.
export async function removeMoney(userId, amount) {
  const user = await collection.findOneAndUpdate(
    { userId },
    [
      {
        $set: {
          money: {
            $max: [
              0,
              { $subtract: [{ $ifNull: ['$money', 0] }, amount] }
            ]
          }
        }
      }
    ],
    { upsert: true, returnDocument: 'after' }
  );

  return user?.money || 0;
}

// Retira o valor SOMENTE se houver saldo suficiente (checagem + débito
// numa única operação, sem brecha para corrida entre duas execuções).
async function debitarSeTiverSaldo(userId, amount) {
  const res = await collection.updateOne(
    { userId, money: { $gte: amount } },
    { $inc: { money: -amount } }
  );

  return res.modifiedCount === 1;
}

export async function transferMoney(fromId, toId, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) return false;

  const debitou = await debitarSeTiverSaldo(fromId, amount);

  if (!debitou) return false;

  try {
    await addMoney(toId, amount);
  } catch (err) {
    // Falhou ao creditar: devolve o dinheiro para quem pagou.
    await addMoney(fromId, amount).catch(() => {});
    throw err;
  }

  return true;
}

export async function getRanking() {
  return await collection
    .find({ money: { $gt: 0 } })
    .sort({ money: -1 })
    .limit(10)
    .toArray();
}

// Soma ao valor já pendente (não sobrescreve mais).
export async function criarGranaPendente(userId, valor) {
  const user = await collection.findOneAndUpdate(
    { userId },
    { $inc: { granaPendente: valor } },
    { upsert: true, returnDocument: 'after' }
  );

  return user?.granaPendente || valor;
}

export async function pegarGranaPendente(userId) {
  const user = await collection.findOne({ userId });
  return user?.granaPendente || 0;
}

export async function removerGranaPendente(userId) {
  await collection.updateOne(
    { userId },
    { $unset: { granaPendente: '' } }
  );
}

// Move a grana pendente para o saldo numa única operação atômica.
// Retorna o valor recebido (0 se não havia nada pendente).
// Dois cliques/execuções simultâneas não conseguem receber duas vezes.
export async function receberGranaPendente(userId) {
  const antes = await collection.findOneAndUpdate(
    { userId, granaPendente: { $gt: 0 } },
    [
      {
        $set: {
          money: {
            $add: [{ $ifNull: ['$money', 0] }, '$granaPendente']
          }
        }
      },
      { $unset: 'granaPendente' }
    ],
    { returnDocument: 'before' }
  );

  return antes?.granaPendente || 0;
}
