import { ChannelType } from 'discord.js';
import { db } from './database.js';
import { listarTiposTicket, pegarTipoTicket } from './tickets.js';
import { painelPublicoTicket } from '../panels/painelPublicoTicket.js';

const collection = db.collection('ticketPainel');

// Painel público ÚNICO do servidor: um menu com todos os tipos de ticket.
export const PAINEL_PADRAO = {
  titulo: '🎫 Central de Tickets',
  descricao: 'Selecione abaixo o tipo de ticket que você deseja abrir.',
  cor: '#5865F2',
  placeholder: 'Tickets',
  banner: null
};

const CAMPOS = [
  'channelId',
  'titulo',
  'descricao',
  'banner',
  'cor',
  'placeholder',
  'messageId',
  'messageChannelId'
];

export async function pegarPainelPublico(guildId) {
  const doc = await collection.findOne({ guildId });

  const salvo = Object.fromEntries(
    Object.entries(doc || {}).filter(([k, v]) => k !== '_id' && v != null)
  );

  // Servidores que já usavam um painel só: aproveita o canal antigo.
  if (!salvo.channelId) {
    const principal = await pegarTipoTicket(guildId, 'principal');
    if (principal?.panelChannelId) salvo.channelId = principal.panelChannelId;
  }

  return { ...PAINEL_PADRAO, ...salvo, guildId };
}

export async function salvarCampoPainelPublico(guildId, campo, valor) {
  if (!CAMPOS.includes(campo)) return null;

  await collection.updateOne(
    { guildId },
    { $set: { guildId, [campo]: valor } },
    { upsert: true }
  );

  return pegarPainelPublico(guildId);
}

// Monta o painel com os tickets que já estão prontos (têm cargo staff).
export async function montarPainelPublico(guildId) {
  const [config, tipos] = await Promise.all([
    pegarPainelPublico(guildId),
    listarTiposTicket(guildId)
  ]);

  const prontos = tipos.filter(t => t.staffRoleId);

  return { config, tipos: prontos, payload: painelPublicoTicket(config, prontos) };
}

// Envia o painel (ou atualiza a mensagem que já foi enviada).
export async function enviarPainelPublico(guild) {
  const { config, tipos, payload } = await montarPainelPublico(guild.id);

  if (!config.channelId) {
    return { erro: 'Defina primeiro o canal do painel.' };
  }

  if (!tipos.length) {
    return {
      erro: 'Crie pelo menos um ticket com cargo staff antes de enviar o painel.'
    };
  }

  const canal = await guild.channels.fetch(config.channelId).catch(() => null);

  if (!canal || canal.type !== ChannelType.GuildText) {
    return { erro: 'O canal configurado não existe ou não é um canal de texto.' };
  }

  if (config.messageId && config.messageChannelId === canal.id) {
    const antiga = await canal.messages.fetch(config.messageId).catch(() => null);

    if (antiga) {
      await antiga.edit(payload);
      return { canal, atualizado: true };
    }
  }

  const mensagem = await canal.send(payload);

  await salvarCampoPainelPublico(guild.id, 'messageId', mensagem.id);
  await salvarCampoPainelPublico(guild.id, 'messageChannelId', canal.id);

  return { canal, atualizado: false };
}

// Mantém o menu do painel já enviado em dia quando um ticket é alterado.
export async function atualizarPainelPublico(guild) {
  try {
    const config = await pegarPainelPublico(guild.id);
    const canalId = config.messageChannelId || config.channelId;

    if (!config.messageId || !canalId) return false;

    const canal = await guild.channels.fetch(canalId).catch(() => null);
    const mensagem = await canal?.messages?.fetch(config.messageId).catch(() => null);

    if (!mensagem) return false;

    const { tipos, payload } = await montarPainelPublico(guild.id);
    if (!tipos.length) return false;

    await mensagem.edit(payload);
    return true;
  } catch (err) {
    console.error('Atualizar painel de tickets:', err.message);
    return false;
  }
}
