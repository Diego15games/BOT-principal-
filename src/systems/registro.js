import { db } from './database.js';

const registros =
db.collection('registros');

const config =
db.collection('registroConfig');

const pendentes =
db.collection('registroPendente');

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

export async function salvarRegistroPendente(
userId,
dados
) {

await pendentes.updateOne(
{
userId
},
{
$set: dados
},
{
upsert: true
}
);

}

export async function pegarRegistroPendente(
userId
) {

return await pendentes.findOne({
userId
});

}

export async function removerRegistroPendente(
userId
) {

await pendentes.deleteOne({
userId
});

}

export async function salvarMensagemPainel(messageId) {

const config = await pegarConfig() || {};

config.painelRegistroId = messageId;

await salvarConfig(config);

}

export async function pegarMensagemPainel() {

const config = await pegarConfig();

return config?.painelRegistroId;

  }
