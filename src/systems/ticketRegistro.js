import { db } from './database.js';

// Registro numerado de todos os tickets (abertos e fechados) de cada servidor.
const collection = db.collection('ticketRegistros');

collection.createIndex({ guildId: 1, numero: 1 }, { unique: true }).catch(() => {});
collection.createIndex({ channelId: 1 }).catch(() => {});

export function formatarNumero(numero) {
  return String(numero).padStart(4, '0');
}

// Troca (ou coloca) o número no final do nome do canal: "duvidas-0004".
export function nomeComNumero(nomeAtual, numero) {
  const n = formatarNumero(numero);

  return /-\d{4,}$/.test(nomeAtual)
    ? nomeAtual.replace(/-\d{4,}$/, `-${n}`)
    : `${nomeAtual}-${n}`.slice(0, 100);
}

async function listarRegistros(guildId) {
  return collection.find({ guildId }).sort({ numero: 1 }).toArray();
}

// Reserva o próximo número (sempre o maior atual + 1, sem buracos).
export async function reservarNumeroTicket(guildId, { userId, tipoId }) {
  for (let tentativa = 0; tentativa < 8; tentativa++) {
    const [ultimo] = await collection
      .find({ guildId })
      .sort({ numero: -1 })
      .limit(1)
      .toArray();

    const numero = (ultimo?.numero || 0) + 1;

    try {
      await collection.insertOne({
        guildId,
        numero,
        userId,
        tipoId,
        channelId: null,
        aberto: true,
        criadoEm: Date.now()
      });

      return numero;
    } catch (err) {
      // Outro ticket pegou o mesmo número ao mesmo tempo: tenta o próximo.
      if (err?.code !== 11000) throw err;
    }
  }

  throw new Error('Não foi possível reservar o número do ticket.');
}

export async function vincularCanalTicket(guildId, numero, channelId) {
  await collection.updateOne({ guildId, numero }, { $set: { channelId } });
}

// Se o canal não pôde ser criado, devolve o número reservado.
export async function liberarNumeroTicket(guildId, numero) {
  await collection.deleteOne({ guildId, numero });
}

export async function marcarTicketFechado(channelId) {
  await collection.updateOne(
    { channelId },
    { $set: { aberto: false, fechadoEm: Date.now() } }
  );
}

export async function pegarRegistroTicket(guildId, numero) {
  return collection.findOne({ guildId, numero });
}

export async function pegarRegistroPorCanal(channelId) {
  return collection.findOne({ channelId });
}

// Quantos tickets vêm depois deste número (e serão renumerados).
export async function contarSeguintes(guildId, numero) {
  const todos = await listarRegistros(guildId);
  return todos.filter(r => r.numero > numero).length;
}

// Apaga o registro do número e puxa todos os seguintes uma posição para trás
// (5 vira 4, 6 vira 5...), valendo para tickets abertos e fechados.
export async function apagarNumeroTicket(guildId, numero) {
  const registro = await pegarRegistroTicket(guildId, numero);
  if (!registro) return null;

  await collection.deleteOne({ guildId, numero });

  const seguintes = (await listarRegistros(guildId)).filter(
    r => r.numero > numero
  );

  const renumerados = [];

  // Em ordem crescente, para nunca repetir um número.
  for (const item of seguintes) {
    await collection.updateOne(
      { guildId, numero: item.numero },
      { $set: { numero: item.numero - 1 } }
    );

    renumerados.push({
      channelId: item.channelId,
      aberto: item.aberto,
      de: item.numero,
      para: item.numero - 1
    });
  }

  return { registro, renumerados };
}
