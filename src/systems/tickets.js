
import { db } from './database.js';

const collection = db.collection('tickets');
const configCollection = db.collection('ticketConfig');

// Cria um índice para impedir que duas pessoas assumam o mesmo ticket.
collection.createIndex(
  { channelId: 1 },
  { unique: true }
).catch(err => {
  console.error('Índice tickets:', err.message);
});

// Salvar configurações dos tickets.
export async function configurarTickets(dados) {
  const { guildId, ...config } = dados;

  if (!guildId) {
    throw new Error(
      'guildId é obrigatório para configurar os tickets.'
    );
  }

  await configCollection.updateOne(
    { guildId },
    {
      $set: {
        ...config,
        guildId
      }
    },
    { upsert: true }
  );
}

// Buscar configurações de um servidor.
export async function pegarConfigTickets(guildId) {
  if (!guildId) return null;

  return await configCollection.findOne({ guildId });
}

// Verificar se um canal é um ticket.
export function isTicketChannel(channel) {
  if (
    !channel ||
    !channel.isTextBased?.() ||
    channel.isDMBased?.()
  ) {
    return false;
  }

  return Boolean(
    channel.topic?.startsWith('ticket:') ||
    channel.name?.startsWith('ticket-')
  );
}

// Buscar o ID do criador do ticket.
export function getTicketCreatorId(channel) {
  if (!channel?.topic?.startsWith('ticket:')) {
    return null;
  }

  return channel.topic.slice('ticket:'.length) || null;
}

// Assumir um ticket.
export async function assumirTicket(channelId, staffId) {
  try {
    await collection.insertOne({
      channelId,
      claimedBy: staffId,
      claimedAt: Date.now()
    });

    return null;
  } catch (err) {
    // O ticket já foi assumido por outra pessoa.
    if (err.code === 11000) {
      const atual = await collection.findOne({ channelId });

      return atual?.claimedBy || 'desconhecido';
    }

    throw err;
  }
}

// Buscar quem assumiu o ticket.
export async function pegarAssumidoPor(channelId) {
  const ticket = await collection.findOne({ channelId });

  return ticket?.claimedBy || null;
}

// Remover o registro do ticket.
export async function removerTicket(channelId) {
  await collection.deleteOne({ channelId });
}

// Verificar se o membro responsável pode fechar o ticket.
export async function podeFecharTicket(member, channel) {
  if (!member || !channel) {
    return false;
  }

  return (
    (await pegarAssumidoPor(channel.id)) === member.id
  );
}

// Mensagem de falta de permissão.
export const MSG_SEM_PERMISSAO_FECHAR =
  '❌ Apenas o staff que assumiu este ticket pode fechá-lo.';
