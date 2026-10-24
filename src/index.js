import {
Client,
Collection,
GatewayIntentBits,
Partials
} from 'discord.js';

import './systems/database.js';

// Evita que um erro solto derrube o bot inteiro.
process.on('unhandledRejection', err => {
  console.error('❌ unhandledRejection:', err);
});

process.on('uncaughtException', err => {
  console.error('❌ uncaughtException:', err);
});

import fs from 'fs';
import http from 'http';
import path from 'path';

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

client.login(process.env.DISCORD_TOKEN);
