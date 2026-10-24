import { pegarConfig } from '../systems/registro.js';
import { db } from '../systems/database.js';

const serverConfigCollection = db.collection('serverConfig');

export default {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      const config = await pegarConfig();
      if (config?.cargoNaoRegistrado) {
        await member.roles.add(config.cargoNaoRegistrado).catch(err => console.error('Não foi possível atribuir cargo não registrado:', err.message));
      }

      const geral = await serverConfigCollection.findOne({ guildId: member.guild.id });
      const canalId = geral?.welcomeChannelId || config?.canal;
      const canal = canalId
        ? await member.guild.channels.fetch(canalId).catch(() => null)
        : member.guild.systemChannel;
      if (!canal?.isTextBased()) return;

      await canal.send({
        content: `👋 Bem-vindo(a) ${member} ao servidor!\n\n📋 Faça seu registro para acessar os canais disponíveis.`
      }).catch(err => console.error('Não foi possível enviar boas-vindas:', err.message));
    } catch (error) {
      console.error('Erro no evento guildMemberAdd:', error);
    }
  }
};
