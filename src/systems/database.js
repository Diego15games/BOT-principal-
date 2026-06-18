import { MongoClient } from 'mongodb';

let db;

try {

const client = new MongoClient(
process.env.MONGO_URI
);

await client.connect();

db = client.db('xtbot');

console.log('✅ MongoDB conectado');

} catch (err) {

console.error('❌ ERRO MONGODB');
console.error(err);

}

export { db };
