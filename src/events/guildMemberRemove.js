export default {
  name: 'guildMemberRemove',

  async execute(member) {
    const canal = member.guild.systemChannel;

    if (!canal) return;

    await canal
      .send(`😢 ${member.user.tag} saiu do servidor.`)
      .catch(() => {});
  }
};
