import fs from 'fs';

const PATH = './database/registros.json';

function load() {
try {
return JSON.parse(fs.readFileSync(PATH, 'utf8'));
} catch {
return {};
}
}

function save(data) {
fs.writeFileSync(PATH, JSON.stringify(data, null, 2));
}

export function registrar(userId, nick) {
const data = load();

data[userId] = {
nick,
registradoEm: Date.now()
};

save(data);

return data[userId];
}

export function verificarRegistro(userId) {
const data = load();
return data[userId] || null;
}

export function removerRegistro(userId) {
const data = load();

if (!data[userId]) return false;

delete data[userId];

save(data);

return true;
}