import fs from 'fs';

const PATH = './database/tickets.json';

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

export function createTicket(channelId, creatorId) {
const data = load();

data[channelId] = {
creator: creatorId,
claimedBy: null,
calledStaff: [],
createdAt: Date.now()
};

save(data);
}

export function getTicket(channelId) {
const data = load();
return data[channelId] || null;
}

export function claimTicket(channelId, staffId) {
const data = load();

if (!data[channelId]) return false;

data[channelId].claimedBy = staffId;

save(data);

return true;
}

export function callStaff(channelId, staffId) {
const data = load();

if (!data[channelId]) return false;

if (!data[channelId].calledStaff.includes(staffId)) {
data[channelId].calledStaff.push(staffId);
}

save(data);

return true;
}

export function deleteTicket(channelId) {
const data = load();

delete data[channelId];

save(data);
}