import { gerarTranscript } from './transcript.js';
import { removerTicket, pegarConfigTickets } from './tickets.js';

// Gera transcript, envia ao canal de logs configurado e exclui o ticket.
export async function fecharTicket(interaction, config = null, aviso = '🔒 Ticket será fechado em alguns segundos.') {
  const canal = interaction.channel;
  if (!canal || !interaction.guild) throw new Error('Este comando só pode ser usado em um ticket do servidor.');
  config = config || await pegarConfigTickets(interaction.guildId);

  await interaction.reply({ content: aviso });
  try {
    const arquivo = await gerarTranscript(canal);
    const logId = config?.logChannelId || config?.ticketLogs;
    const logs = logId ? await interaction.guild.channels.fetch(logId).catch(() => null) : null;
    if (logs?.isTextBased()) {
      await logs.send({
        content: `📋 Transcript de **#${canal.name}** (fechado por ${interaction.user})`,
        ...(arquivo ? { files: [arquivo] } : {})
      });
    }
  } catch (err) {
    console.error('Erro ao gerar/enviar transcript:', err);
  }
  await removerTicket(canal.id).catch(() => {});
  setTimeout(() => canal.delete().catch(() => {}), 2500);
}
