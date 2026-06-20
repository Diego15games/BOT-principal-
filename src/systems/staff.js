import fs from 'fs';

const PATH = './database/staff.json';

function load() {
try {
return JSON.parse(
fs.readFileSync(
PATH,
'utf8'
)
);
} catch {
return {};
}
}

function save(data) {
fs.writeFileSync(
PATH,
JSON.stringify(
data,
null,
2
)
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

if (
data[userId].pontos < 0
) {
data[userId].pontos = 0;
}

save(data);

return data[userId];

}

export function addWarning(
userId,
motivo = 'Não informado'
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
data:
new Date()
.toLocaleString(
'pt-BR'
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
