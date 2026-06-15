import fs from 'fs';

const PATH = './database/economia.json';

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

export function getMoney(userId) {
const data = load();
return data[userId]?.money || 0;
}

export function addMoney(userId, amount) {
const data = load();

if (!data[userId]) {
data[userId] = {
money: 0,
lastDaily: 0
};
}

data[userId].money += amount;

save(data);

return data[userId].money;
}

export function removeMoney(userId, amount) {
const data = load();

if (!data[userId]) return 0;

data[userId].money -= amount;

if (data[userId].money < 0) {
data[userId].money = 0;
}

save(data);

return data[userId].money;
}

export function transferMoney(fromId, toId, amount) {
const data = load();

if (!data[fromId]) return false;

if ((data[fromId].money || 0) < amount) {
return false;
}

if (!data[toId]) {
data[toId] = {
money: 0,
lastDaily: 0
};
}

data[fromId].money -= amount;
data[toId].money += amount;

save(data);

return true;
}

export function claimDaily(userId) {
const data = load();

if (!data[userId]) {
data[userId] = {
money: 0,
lastDaily: 0
};
}

const now = Date.now();
const cooldown = 24 * 60 * 60 * 1000;

if (now - data[userId].lastDaily < cooldown) {
return false;
}

data[userId].lastDaily = now;
data[userId].money += 1000;

save(data);

return true;
}

export function getRanking() {
const data = load();

return Object.entries(data)
.sort((a, b) => b[1].money - a[1].money)
.slice(0, 10);
}