import {
Client,
Collection,
GatewayIntentBits,
Partials
} from 'discord.js';

import fs from 'fs';
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

if (event.default.once) {

client.once(
  event.default.name,
  (...args) =>
    event.default.execute(
      ...args,
      client
    )
);

} else {

client.on(
  event.default.name,
  (...args) =>
    event.default.execute(
      ...args,
      client
    )
);

}
}

client.login(process.env.DISCORD_TOKEN);