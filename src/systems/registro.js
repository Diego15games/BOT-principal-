import { db } from './database.js';

const registros =
db.collection('registros');

const config =
db.collection('registroConfig');

export async function criarRegistro(
userId,
dados
) {

await registros.updateOne(
{
userId
},
{
$set: {
...dados,
registrado: true
}
},
{
upsert: true
}
);

}

export async function atualizarRegistro(
userId,
dados
) {

await registros.updateOne(
{
userId
},
{
$set: dados
}
);

}

export async function pegarRegistro(
userId
) {

return await registros.findOne({
userId
});

}

export async function estaRegistrado(
userId
) {

const user =
await registros.findOne({
userId
});

return !!user;

}

export async function salvarConfig(
dados
) {

await config.updateOne(
{
id: 'registro'
},
{
$set: dados
},
{
upsert: true
}
);

}

export async function pegarConfig() {

return await config.findOne({
id: 'registro'
});

}
