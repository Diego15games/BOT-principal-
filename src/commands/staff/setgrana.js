import {
SlashCommandBuilder,
PermissionFlagsBits,
EmbedBuilder
} from 'discord.js';

import {
criarGranaPendente
} from '../../systems/economia.js';

export default {
data: new SlashCommandBuilder()
.setName('setgrana')
.setDescription('Liberar dinheiro para um jogador')
.addUserOption(option =>
option
.setName('usuario')
.setDescription('Jogador')
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName('valor')
.setDescription('Valor')
.setRequired(true)
)
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

async execute(interaction) {

const usuario =
  interaction.options.getUser('usuario');

const valor =
  interaction.options.getInteger('valor');

if (valor <= 0) {
  return interaction.reply({
    content: '❌ Valor inválido.',
    ephemeral: true
  });
}

await criarGranaPendente(
  usuario.id,
  valor
);

const CANAL_COMANDOS =
'1516983136486035648';

try {

await usuario.send({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setTitle('💰 Dinheiro Disponível')
.setDescription(
`A staff liberou R$ ${valor.toLocaleString('pt-BR')} para você.

Use o comando /receber no canal <#${CANAL_COMANDOS}> para sacar seu dinheiro.`
)
]
});

} catch {

console.log(
"Não foi possível enviar DM para ${usuario.tag}"
);

}

return interaction.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(
        `✅ Dinheiro liberado para ${usuario}. O jogador foi notificado no privado.`
      )
  ],
  ephemeral: true
});

}
};
