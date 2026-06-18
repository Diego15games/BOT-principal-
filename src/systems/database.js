import { MongoClient } from 'mongodb';

try {

const client = new MongoClient(
process.env.MONGO_URI
);

await client.connect();

console.log('✅ MongoDB conectado');

export const db =
client.db('xtbot');

} catch (err) {

console.error('❌ ERRO MONGODB');
console.error(err);

}
