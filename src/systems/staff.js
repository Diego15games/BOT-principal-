import { db } from './database.js';

const collection = db.collection('staff');
const configCollection = db.collection('staffConfig');
collection.createIndex({ userId: 1 }, { unique: true }).catch(err => console.error('Índice staff:', err.message));

const PADRAO = { pontos: 0, advertencias: 0, tickets: 0, historico: [] };
function dataAgora() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
export async function getStaff(userId) {
  const dados = await collection.findOne({ userId });
  return { ...PADRAO, historico: [], ...dados };
}
export async function addPoints(userId, amount = 1) {
  await collection.updateOne({ userId }, { $inc: { pontos: amount }, $setOnInsert: { advertencias: 0, tickets: 0, historico: [] } }, { upsert: true });
  await collection.updateOne({ userId, pontos: { $lt: 0 } }, { $set: { pontos: 0 } });
  return await getStaff(userId);
}
export async function removePoints(userId, amount = 1) { return await addPoints(userId, -Math.abs(amount)); }
export async function addWarning(userId, motivo = 'Não informado', staffId = 'Desconhecido') {
  await collection.updateOne({ userId }, { $inc: { advertencias: 1 }, $push: { historico: { motivo, staffId, data: dataAgora() } }, $setOnInsert: { pontos: 0, tickets: 0 } }, { upsert: true });
  return await getStaff(userId);
}
export async function addTicket(userId) {
  await collection.updateOne({ userId }, { $inc: { tickets: 1 }, $setOnInsert: { pontos: 0, advertencias: 0, historico: [] } }, { upsert: true });
  return await getStaff(userId);
}
export async function removeWarning(userId) {
  const dados = await collection.findOne({ userId });
  if (!dados || !(dados.advertencias > 0)) return null;
  await collection.updateOne({ userId, advertencias: { $gt: 0 } }, { $inc: { advertencias: -1 }, $pop: { historico: 1 } });
  return await getStaff(userId);
}
export async function listarAdvertencias(userId) {
  const dados = await getStaff(userId);
  return (dados.historico || []).filter(item => item.motivo);
}
export const advertirUsuario = addWarning;
export const removerAdvertencia = removeWarning;
export async function salvarConfigStaff(dados) {
  await configCollection.updateOne({ guildId: dados.guildId }, { $set: dados }, { upsert: true });
}
export async function obterInfoStaff(userId) { return await getStaff(userId); }
export async function obterPerfilStaff(userId) { return await getStaff(userId); }
export async function adicionarPontosStaff(userId, quantidade, motivo = 'Não informado', staffId = 'Desconhecido') {
  const dados = await addPoints(userId, quantidade);
  await collection.updateOne({ userId }, { $push: { historico: { motivo, staffId, tipo: 'pontos', data: dataAgora() } } });
  return dados;
}
