import fs from 'fs';

export default {
name: 'clientReady',
once: true,

async execute(client) {

console.log(
`✅ Online como ${client.user.tag}`
);

const commands = [];

const folders =
fs.readdirSync('./src/commands');

for (const folder of folders) {

const files =
fs.readdirSync(`./src/commands/${folder}`)
.filter(file => file.endsWith('.js'));
for (const file of files) {

const command =
await import(
`../commands/${folder}/${file}`
);

if (!command.default?.data) continue;

commands.push(
command.default.data.toJSON()
);

}

}

await client.application.commands.set(
commands
);

console.log(
`✅ ${commands.length} comandos registrados.`
);

}
};
