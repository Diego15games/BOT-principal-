import {
Client,
Collection,
GatewayIntentBits,
Partials
} from 'discord.js';

import './systems/database.js';

process.on('unhandledRejection', err => {
  console.error('❌ Promessa rejeitada sem tratamento:', err);
});

// Uma exceção não tratada pode deixar o processo em estado inconsistente.
// Registra o erro e encerra para que a hospedagem reinicie o bot limpo.
process.on('uncaughtException', err => {
  console.error('❌ Exceção não tratada; encerrando para reinicialização segura:', err);
  process.exit(1);
});

import fs from 'fs';
import http from 'http';

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
],
partials: [
Partials.Channel
]
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Remove cooldowns expirados periodicamente para evitar crescimento
// desnecessário da memória em processos que ficam online por muito tempo.
const cooldownCleanup = setInterval(() => {
  const agora = Date.now();
  for (const [key, expiry] of client.cooldowns) {
    if (expiry <= agora) client.cooldowns.delete(key);
  }
}, 5 * 60 * 1000);
cooldownCleanup.unref?.();

// ======================
// CARREGAR COMANDOS
// ======================

const commandFolders =
fs.readdirSync('./src/commands');

for (const folder of commandFolders) {

const commandFiles =
fs.readdirSync(`./src/commands/${folder}`)
.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

const command =
  await import(
    `./commands/${folder}/${file}`
  );

if (!command.default?.data?.name) {
  console.log(`Comando inválido: ${file}`);
  continue;
}

client.commands.set(
  command.default.data.name,
  command.default
);

}
}

// ======================
// CARREGAR EVENTOS
// ======================

const eventFiles =
fs.readdirSync('./src/events')
.filter(file => file.endsWith('.js'));

for (const file of eventFiles) {

const event =
await import(`./events/${file}`);

if (!event.default) {
  console.log(`Evento inválido: ${file}`);
  continue;
}

if (event.default.once) {

client.once(
  event.default.name,
  (...args) =>
    Promise.resolve(
      event.default.execute(
        ...args,
        client
      )
    ).catch(err =>
      console.error(`Erro no evento ${event.default.name}:`, err)
    )
);

} else {

client.on(
  event.default.name,
  (...args) =>
    Promise.resolve(
      event.default.execute(
        ...args,
        client
      )
    ).catch(err =>
      console.error(`Erro no evento ${event.default.name}:`, err)
    )
);

}
}

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ Variável de ambiente DISCORD_TOKEN não definida.');
  process.exit(1);
}

// Servidor HTTP mínimo: só sobe quando a hospedagem define a variável PORT
// (ex.: Render). Serve para o health check e para serviços de "ping"
// manterem o serviço acordado. Em hospedagens sem PORT, nada muda.
if (process.env.PORT) {
  http
    .createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Bot online');
    })
    .listen(process.env.PORT, () => {
      console.log(`🌐 Health check na porta ${process.env.PORT}`);
    });
}

try {
  await client.login(process.env.DISCORD_TOKEN);
} catch (err) {
  console.error('❌ Não foi possível conectar ao Discord. Confira DISCORD_TOKEN e a conexão de rede.');
  console.error(err);
  process.exit(1);
}
