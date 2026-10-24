export default {
  name: 'clientReady',
  once: true,

  async execute(client) {
    console.log(`✅ Online como ${client.user.tag}`);

    // Reaproveita os comandos já carregados no index.js
    // (antes todos os arquivos eram importados uma segunda vez aqui).
    const commands = [...client.commands.values()].map(command =>
      command.data.toJSON()
    );

    await client.application.commands.set(commands);

    console.log(`✅ ${commands.length} comandos registrados.`);
  }
};
