import { db } from './database.js';

const collection = db.collection('tickets');
const configCollection = db.collection('ticketConfig');

collection.createIndex(
{ channelId: 1 },
{ unique: true }
).catch(err => console.error('Índice tickets:', err.message));

export async function configurarTickets(dados) {
const { guildId, ...config } = dados;

if (!guildId) {
throw new Error('guildId é obrigatório para configurar os tickets.');
}

await configCollection.updateOne(
{ guildId },
{ $set: config },
{ upsert: true }
);
}

export async function pegarConfigTickets(guildId) {
if (!guildId) return null;

return await configCollection.findOne({ guildId });
}

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

export async function podeFecharTicket(member, channel) {
if (!member || !channel) return false;

return (await pegarAssumidoPor(channel.id)) === member.id;
}

export const MSG_SEM_PERMISSAO_FECHAR =
'❌ Apenas o staff que assumiu este ticket pode fechá-lo.';
