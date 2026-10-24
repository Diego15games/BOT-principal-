import { pegarConfig } from '../systems/registro.js';

export default {
  name: 'guildMemberAdd',

  async execute(member) {
    const config = await pegarConfig();

    if (!config) return;

    if (config.cargoNaoRegistrado) {
      try {
        await member.roles.add(config.cargoNaoRegistrado);
      } catch (err) {
        console.log(err);
      }
    }

    const canal = member.guild.systemChannel;

    if (!canal) return;

    await canal
      .send({
        content:
          `🎉 Bem-vindo ${member} ao servidor!\n\n` +
          `📋 Para acessar todos os canais, faça seu registro no canal configurado pela staff.`
      })
      .catch(() => {});
  }
};
