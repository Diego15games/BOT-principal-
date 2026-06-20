import fs from 'fs';

const PATH = './database/staff.json';

function load() {
try {
return JSON.parse(
fs.readFileSync(PATH, 'utf8')
);
} catch {
return {};
}
}

function save(data) {
fs.writeFileSync(
PATH,
JSON.stringify(data, null, 2)
);
}

export function getStaff(userId) {

const data = load();

if (!data[userId]) {

data[userId] = {
pontos: 0,
advertencias: 0,
tickets: 0,
historico: []
};

save(data);

}

return data[userId];

}

export function addPoints(
userId,
amount = 1
) {

const data = load();

if (!data[userId]) {

data[userId] = {
pontos: 0,
advertencias: 0,
tickets: 0,
historico: []
};

}

data[userId].pontos += amount;

save(data);

return data[userId];

}

export function removePoints(
userId,
amount = 1
) {

const data = load();

if (!data[userId]) return;

data[userId].pontos -= amount;

if (data[userId].pontos < 0) {
data[userId].pontos = 0;
}

save(data);

return data[userId];

}

export function addWarning(
userId,
motivo = 'Não informado',
staffId = 'Desconhecido'
) {

const data = load();

if (!data[userId]) {

data[userId] = {
pontos: 0,
advertencias: 0,
tickets: 0,
historico: []
};

}

data[userId].advertencias++;

data[userId].historico.push({
motivo,
staffId,
data:
new Date().toLocaleString(
'pt-BR',
{
timeZone:
'America/Sao_Paulo',
day: '2-digit',
month: '2-digit',
year: 'numeric',
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
}
)
});

save(data);

return data[userId];

}

export function addTicket(
userId
) {

const data = load();

if (!data[userId]) {

data[userId] = {
pontos: 0,
advertencias: 0,
tickets: 0,
historico: []
};

}

data[userId].tickets++;

save(data);

return data[userId];

}

export function removeWarning(
userId
) {

const data = load();

if (!data[userId]) {
return null;
}

if (
data[userId].advertencias > 0
) {

data[userId].advertencias--;

if (
data[userId].historico &&
data[userId].historico.length > 0
) {
data[userId].historico.pop();
}

save(data);

}

return data[userId];

}
