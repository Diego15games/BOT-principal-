import { db } from '../systems/database.js';

const serverConfigCollection = db.collection('serverConfig');

export default {
  name: 'guildMemberRemove',
  async execute(member) {
    try {
      const config = await serverConfigCollection.findOne({ guildId: member.guild.id });
      const canal = config?.leaveChannelId
        ? await member.guild.channels.fetch(config.leaveChannelId).catch(() => null)
        : member.guild.systemChannel;
      if (!canal?.isTextBased()) return;
      await canal.send(`😢 ${member.user.tag} saiu do servidor.`).catch(err => console.error('Não foi possível enviar aviso de saída:', err.message));
    } catch (error) {
      console.error('Erro no evento guildMemberRemove:', error);
    }
  }
};
