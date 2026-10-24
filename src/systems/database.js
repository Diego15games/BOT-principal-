import { MongoClient } from 'mongodb';

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('❌ Variável de ambiente MONGO_URI não definida.');
  process.exit(1);
}

const mongo = new MongoClient(MONGO_URI);

try {
  await mongo.connect();
} catch (err) {
  console.error('❌ ERRO AO CONECTAR NO MONGODB');
  console.error(err);
  process.exit(1);
}

const db = mongo.db('xtbot');

console.log('✅ MongoDB conectado');

export { db };
