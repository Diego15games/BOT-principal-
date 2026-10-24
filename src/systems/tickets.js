import { db } from './database.js';

const collection = db.collection('tickets');

collection
  .createIndex({ channelId: 1 }, { unique: true })
  .catch(err => console.error('Índice tickets:', err.message));

// Todo canal de ticket é criado com o topic "ticket:<id do criador>".
// Tickets antigos (sem topic) são reconhecidos pelo prefixo "ticket-".
export function isTicketChannel(channel) {
  if (!channel || !channel.isTextBased?.() || channel.isDMBased?.()) {
    return false;
  }

  return Boolean(
    channel.topic?.startsWith('ticket:') ||
    channel.name?.startsWith('ticket-')
  );
}

export function getTicketCreatorId(channel) {
  if (!channel?.topic?.startsWith('ticket:')) return null;
  return channel.topic.slice('ticket:'.length) || null;
}

// ---- Quem assumiu o ticket ----

// Tenta assumir. Retorna null se conseguiu, ou o ID de quem já tinha assumido.
export async function assumirTicket(channelId, staffId) {
  try {
    await collection.insertOne({
      channelId,
      claimedBy: staffId,
      claimedAt: Date.now()
    });

    return null;
  } catch (err) {
    if (err.code === 11000) {
      const atual = await collection.findOne({ channelId });
      return atual?.claimedBy || 'desconhecido';
    }

    throw err;
  }
}

export async function pegarAssumidoPor(channelId) {
  const ticket = await collection.findOne({ channelId });
  return ticket?.claimedBy || null;
}

export async function removerTicket(channelId) {
  await collection.deleteOne({ channelId });
}

// Regra: SÓ o staff que assumiu o ticket pode fechá-lo.
// Quem abriu o ticket (e qualquer outra pessoa) não pode.
export async function podeFecharTicket(member, channel) {
  if (!member) return false;

  const assumidoPor = await pegarAssumidoPor(channel.id);

  return assumidoPor === member.id;
}

export const MSG_SEM_PERMISSAO_FECHAR =
  '❌ Apenas o staff que assumiu este ticket pode fechá-lo.';
