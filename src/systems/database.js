import { MongoClient } from 'mongodb';

const client = new MongoClient(
process.env.MONGO_URI
);

await client.connect();

console.log('✅ MongoDB conectado');

export const db =
client.db('xtbot');
