
import { randomBytes } from 'node:crypto';
import { db } from './database.js';

const collection = db.collection('tickets');
const configCollection = db.collection('ticketConfig');
const tiposCollection = db.collection('ticketTipos');

export const LIMITE_TIPOS_TICKET = 25;

// Cria um índice para impedir que duas pessoas assumam o mesmo ticket.
collection.createIndex(
  { channelId: 1 },
  { unique: true }
).catch(err => {
  console.error('Índice tickets:', err.message);
});

tiposCollection.createIndex(
  { guildId: 1, tipoId: 1 },
  { unique: true }
).catch(err => {
  console.error('Índice tipos de ticket:', err.message);
});

// IDs dos cargos staff de um tipo de ticket (aceita vários, separados por espaço ou vírgula).
export function staffRoleIds(config) {
  const valor = config?.staffRoleId;
  if (!valor) return [];

  const valores = Array.isArray(valor)
    ? valor
    : String(valor).split(/[\s,;]+/);

  return [
    ...new Set(
      valores
        .map(item => String(item).replace(/^<@&?(\d+)>$/, '$1'))
        .filter(item => /^\d{17,20}$/.test(item))
    )
  ];
}

// Verificar se o membro tem algum cargo staff do tipo de ticket.
export function memberIsStaff(member, config) {
  return staffRoleIds(config).some(id => member?.roles?.cache?.has(id));
}

// Servidores que já tinham a configuração única passam a ter o tipo "principal".
async function migrarConfigAntiga(guildId) {
  if (await tiposCollection.countDocuments({ guildId }, { limit: 1 })) {
    return;
  }

  const antiga = await configCollection.findOne({ guildId });
  if (!antiga || antiga.migrado) return;

  const { _id, migrado, ...dados } = antiga;

  await tiposCollection.updateOne(
    { guildId, tipoId: 'principal' },
    {
      $setOnInsert: {
        ...dados,
        guildId,
        tipoId: 'principal',
        nome: 'Principal',
        criadoEm: Date.now()
      }
    },
    { upsert: true }
  );

  // Marca como migrada para não voltar caso todos os tipos sejam excluídos.
  await configCollection.updateOne({ guildId }, { $set: { migrado: true } });
}

// Listar todos os tipos de ticket do servidor.
export async function listarTiposTicket(guildId) {
  if (!guildId) return [];

  await migrarConfigAntiga(guildId);

  return await tiposCollection
    .find({ guildId })
    .sort({ criadoEm: 1 })
    .toArray();
}

// Buscar um tipo de ticket. Sem tipoId (tickets e painéis antigos) usa o "principal".
export async function pegarTipoTicket(guildId, tipoId) {
  if (!guildId) return null;

  await migrarConfigAntiga(guildId);

  return await tiposCollection.findOne({
    guildId,
    tipoId: tipoId || 'principal'
  });
}

// Criar um novo tipo de ticket (ex.: Denúncia, Dúvidas).
export async function criarTipoTicket(guildId, nome) {
  const total = (await listarTiposTicket(guildId)).length;

  if (total >= LIMITE_TIPOS_TICKET) {
    return null;
  }

  const tipo = {
    guildId,
    tipoId: randomBytes(4).toString('hex'),
    nome,
    titulo: `🎫 ${nome}`,
    botao: nome.slice(0, 80),
    emoji: '🎫',
    criadoEm: Date.now()
  };

  await tiposCollection.insertOne(tipo);

  return tipo;
}

// Salvar um campo de um tipo de ticket.
export async function salvarCampoTicket(guildId, tipoId, campo, valor) {
  await tiposCollection.updateOne(
    { guildId, tipoId },
    { $set: { [campo]: valor } }
  );

  return await tiposCollection.findOne({ guildId, tipoId });
}

// Excluir um tipo de ticket.
export async function excluirTipoTicket(guildId, tipoId) {
  await tiposCollection.deleteOne({ guildId, tipoId });
}

// Buscar a configuração do tipo a que um canal de ticket pertence.
export async function pegarConfigDoTicket(guildId, channel) {
  return await pegarTipoTicket(guildId, getTicketTipoId(channel));
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

// O tópico do canal guarda "ticket:<idDoJogador>:<idDoTipo>".
// Tickets antigos têm só "ticket:<idDoJogador>".
export function getTicketCreatorId(channel) {
  if (!channel?.topic?.startsWith('ticket:')) {
    return null;
  }

  return channel.topic.split(':')[1] || null;
}

// Buscar o tipo do ticket (null nos tickets antigos).
export function getTicketTipoId(channel) {
  if (!channel?.topic?.startsWith('ticket:')) {
    return null;
  }

  return channel.topic.split(':')[2] || null;
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
