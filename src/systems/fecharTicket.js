import { gerarTranscript } from './transcript.js';
import { removerTicket } from './tickets.js';

// Gera o transcript, manda para o canal de logs configurado e
// apaga o canal do ticket.
export async function fecharTicket(interaction, config, aviso) {
  const canal = interaction.channel;

  await interaction.reply({ content: aviso });

  try {
    const arquivo = await gerarTranscript(canal);

    const logs = config?.ticketLogs
      ? await interaction.guild.channels
          .fetch(config.ticketLogs)
          .catch(() => null)
      : null;

    if (arquivo && logs?.isTextBased()) {
      await logs.send({
        content:
          `📋 Transcript de **#${canal.name}** ` +
          `(fechado por ${interaction.user})`,
        files: [arquivo]
      });
    }
  } catch (err) {
    console.error('Erro ao gerar transcript:', err);
  }

  await removerTicket(canal.id).catch(() => {});

  setTimeout(() => {
    canal.delete().catch(() => {});
  }, 3000);
}
