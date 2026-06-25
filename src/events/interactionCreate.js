import {
Collection,
EmbedBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ActionRowBuilder,
ChannelType,
PermissionsBitField,
ButtonBuilder,
ButtonStyle
} from 'discord.js';

import fs from 'fs';

import {
criarRegistro,
atualizarRegistro,
pegarRegistro,
estaRegistrado,
pegarConfig,
salvarRegistroPendente,
pegarRegistroPendente,
removerRegistroPendente
} from '../systems/registro.js';

export default {
name: 'interactionCreate',

async execute(interaction, client) {

let ticketConfig = {};

try {
ticketConfig = JSON.parse(
fs.readFileSync(
'./database/ticketConfig.json',
'utf8'
)
);
} catch {
ticketConfig = {};
}

// =========================
// ABRIR TICKET
// =========================

if (
interaction.isButton() &&
interaction.customId === 'open_ticket'
) {

const modal =
new ModalBuilder()
.setCustomId('ticket_modal')
.setTitle('Abrir Ticket');

const nick =
new TextInputBuilder()
.setCustomId('nick')
.setLabel('Seu Nick')
.setStyle(
TextInputStyle.Short
);

const problema =
new TextInputBuilder()
.setCustomId('problema')
.setLabel('Problema')
.setStyle(
TextInputStyle.Short
);

const descricao =
new TextInputBuilder()
.setCustomId('descricao')
.setLabel('Descrição')
.setStyle(
TextInputStyle.Paragraph
);

modal.addComponents(
new ActionRowBuilder()
.addComponents(nick),

new ActionRowBuilder()
  .addComponents(problema),

new ActionRowBuilder()
  .addComponents(descricao)

);

return interaction.showModal(
modal
);
}

// =========================
// CRIAR TICKET
// =========================

if (
interaction.isModalSubmit() &&
interaction.customId === 'ticket_modal'
) {

const nick =
interaction.fields.getTextInputValue(
'nick'
);

const problema =
interaction.fields.getTextInputValue(
'problema'
);

const descricao =
interaction.fields.getTextInputValue(
'descricao'
);

const channel =
await interaction.guild.channels.create({
name: `ticket-${interaction.user.username}`,

  type:
    ChannelType.GuildText,

  parent:
    ticketConfig.categoryId,

  permissionOverwrites: [
    {
      id:
        interaction.guild.id,

      deny: [
        PermissionsBitField.Flags.ViewChannel
      ]
    },

    {
      id:
        interaction.user.id,

      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages
      ]
    },

    {
      id:
        ticketConfig.staffId,

      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages
      ]
    }
  ]
});

const embed =
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'🎫 Novo Ticket'
)
.addFields(
{
name: 'Nick',
value: nick
},
{
name: 'Problema',
value: problema
},
{
name: 'Descrição',
value: descricao
}
);

const row =
new ActionRowBuilder()
.addComponents(

    new ButtonBuilder()
      .setCustomId(
        'claim_ticket'
      )
      .setLabel(
        'Assumir'
      )
      .setStyle(
        ButtonStyle.Success
      ),

    new ButtonBuilder()
      .setCustomId(
        'close_ticket'
      )
      .setLabel(
        'Fechar'
      )
      .setStyle(
        ButtonStyle.Danger
      )
  );

await channel.send({
embeds: [embed],
components: [row]
});

return interaction.reply({
content: `✅ Ticket criado: ${channel}`,
ephemeral: true
});
}

// =========================
// ASSUMIR TICKET
// =========================

if (
interaction.isButton() &&
interaction.customId === 'claim_ticket'
) {

const staffRole =
ticketConfig.staffId;

if (
!interaction.member.roles.cache.has(
staffRole
)
) {
return interaction.reply({
content:
'❌ Apenas a staff pode assumir tickets.',
ephemeral: true
});
}

await interaction.channel.permissionOverwrites.edit(
staffRole,
{
ViewChannel: false
}
);

await interaction.channel.permissionOverwrites.edit(
interaction.user.id,
{
ViewChannel: true,
SendMessages: true
}
);

return interaction.reply({
content: `👮 Ticket assumido por ${interaction.user}`
});
}

// =========================
// FECHAR TICKET
// =========================

if (
interaction.isButton() &&
interaction.customId === 'close_ticket'
) {

const row =
new ActionRowBuilder()
.addComponents(

    new ButtonBuilder()
      .setCustomId(
        'ticket_resolved_yes'
      )
      .setLabel('Sim')
      .setStyle(
        ButtonStyle.Success
      ),

    new ButtonBuilder()
      .setCustomId(
        'ticket_resolved_no'
      )
      .setLabel('Não')
      .setStyle(
        ButtonStyle.Danger
      )
  );

return interaction.reply({
content:
'O ticket foi resolvido?',
components: [row]
});
}

// =========================
// FECHAR COM SUCESSO
// =========================

if (
interaction.isButton() &&
interaction.customId === 'ticket_resolved_yes'
) {

await interaction.reply({
content:
'📋 Gerando transcript e fechando ticket...'
});

setTimeout(() => {
interaction.channel.delete()
.catch(() => {});
}, 3000);

return;
}

// =========================
// FECHAR SEM SUCESSO
// =========================

if (
interaction.isButton() &&
interaction.customId === 'ticket_resolved_no'
) {

await interaction.reply({
content:
'📋 Ticket encerrado.'
});

setTimeout(() => {
interaction.channel.delete()
.catch(() => {});
}, 3000);

return;
}

//
// =========================
// BOTÃO REGISTRAR
// =========================
//

if (
interaction.isButton() &&
interaction.customId ===
'registro_criar'
) {

const registrado =
await estaRegistrado(
interaction.user.id
);

if (registrado) {

return interaction.reply({
content:
'❌ Você já está registrado.',
ephemeral: true
});

}

const modal =
new ModalBuilder()
.setCustomId(
'modal_registro'
)
.setTitle(
'Sistema de Registro'
);

const nome =
new TextInputBuilder()
.setCustomId('nome')
.setLabel('Nome')
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const nick =
new TextInputBuilder()
.setCustomId('nick')
.setLabel('Nick')
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const nascimento =
new TextInputBuilder()
.setCustomId('nascimento')
.setLabel(
'Data de nascimento (DD/MM/AAAA)'
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const sexualidade =
new TextInputBuilder()
.setCustomId('sexualidade')
.setLabel('Sexualidade')
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const plataforma =
new TextInputBuilder()
.setCustomId('plataforma')
.setLabel('Mobile / PC / Ambos')
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(nome),

new ActionRowBuilder()
.addComponents(nick),

new ActionRowBuilder()
.addComponents(nascimento),

new ActionRowBuilder()
.addComponents(sexualidade),

new ActionRowBuilder()
.addComponents(plataforma)
);

return interaction.showModal(
modal
);

}

//
// =========================
// ENVIAR REGISTRO
// =========================
//

if (
interaction.isModalSubmit() &&
interaction.customId ===
'modal_registro'
) {

const nome =
interaction.fields.getTextInputValue('nome');

const nick =
interaction.fields.getTextInputValue('nick');

const nascimento =
interaction.fields.getTextInputValue('nascimento');

const sexualidade =
interaction.fields.getTextInputValue('sexualidade');

const plataforma =
interaction.fields.getTextInputValue('plataforma');

await salvarRegistroPendente(
interaction.user.id,
{
nome,
nick,
nascimento,
sexualidade,
plataforma
}
);

const row =
new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId(
'confirmar_registro'
)
.setLabel(
'☑️ Confirmo que sou humano'
)
.setStyle(
ButtonStyle.Success
)
);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'Confirmar Registro'
)
.setDescription(
'Clique no botão abaixo para finalizar seu registro.'
)
],
components: [row],
ephemeral: true
});

}

//
// =========================
// CONFIRMAR REGISTRO
// =========================
//

if (
interaction.isButton() &&
interaction.customId ===
'confirmar_registro'
) {

const dados =
await pegarRegistroPendente(
interaction.user.id
);

if (!dados) {

return interaction.reply({
content:
'❌ Nenhum registro pendente encontrado.',
ephemeral: true
});

}

const config =
await pegarConfig();

await criarRegistro(
interaction.user.id,
dados
);

await removerRegistroPendente(
interaction.user.id
);

try {

await interaction.member.roles.add(
config.cargoRegistrado
);

await interaction.member.roles.remove(
config.cargoNaoRegistrado
);

} catch {}

try {

await interaction.member.setNickname(
dados.nick
);

} catch {}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'✅ Registro Concluído'
)
.setDescription(
'Seu registro foi concluído com sucesso.'
)
],
ephemeral: true
});

}

//
// =========================
// BOTÃO ATUALIZAR REGISTRO
// =========================
//

if (
interaction.isButton() &&
interaction.customId ===
'registro_atualizar'
) {

const registro =
await pegarRegistro(
interaction.user.id
);

if (!registro) {

return interaction.reply({
content:
'❌ Você ainda não está registrado.',
ephemeral: true
});

}

const modal =
new ModalBuilder()
.setCustomId(
'modal_atualizar_registro'
)
.setTitle(
'Atualizar Registro'
);

const nick =
new TextInputBuilder()
.setCustomId('nick')
.setLabel('Nick')
.setValue(
registro.nick || ''
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const plataforma =
new TextInputBuilder()
.setCustomId('plataforma')
.setLabel('Mobile / PC / Ambos')
.setValue(
registro.plataforma || ''
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder()
.addComponents(nick),

new ActionRowBuilder()
.addComponents(plataforma)
);

return interaction.showModal(
modal
);

}

//
// =========================
// SALVAR ATUALIZAÇÃO
// =========================
//

if (
interaction.isModalSubmit() &&
interaction.customId ===
'modal_atualizar_registro'
) {

const nick =
interaction.fields.getTextInputValue(
'nick'
);

const plataforma =
interaction.fields.getTextInputValue(
'plataforma'
);

await atualizarRegistro(
interaction.user.id,
{
nick,
plataforma
}
);

try {

await interaction.member.setNickname(
nick
);

} catch {}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setColor(0x57f287)
.setTitle(
'✅ Registro Atualizado'
)
.setDescription(
'Suas informações foram atualizadas.'
)
.addFields(
{
name: 'Nick',
value: nick
},
{
name: 'Plataforma',
value: plataforma
}
)
],
ephemeral: true
});

  }

// =========================
// MENU CONFIG XP
// =========================

if (
interaction.isStringSelectMenu() &&
interaction.customId ===
'xp_config_menu'
) {

const escolha =
interaction.values[0];

return interaction.reply({
content:
`Você selecionou: ${escolha}`,
ephemeral: true
});

}

// =========================
// SLASH COMMANDS
// =========================

if (
interaction.isChatInputCommand() &&
!interaction.guild
) {

return interaction.reply({
content:
'❌ Os comandos só podem ser usados dentro de servidores.',
ephemeral: true
});

}

if (!interaction.isChatInputCommand()) return;

const command =
  client.commands.get(
    interaction.commandName
  );

if (!command) return;

const { cooldowns } = client;

if (!cooldowns.has(command.data.name)) {
  cooldowns.set(
    command.data.name,
    new Collection()
  );
}

const timestamps =
  cooldowns.get(command.data.name);

const cooldownMs =
  (command.cooldown ?? 3) * 1000;

const now = Date.now();

if (
  timestamps.has(
    interaction.user.id
  )
) {

  const expiresAt =
    timestamps.get(
      interaction.user.id
    ) + cooldownMs;

  if (now < expiresAt) {

    const remaining =
      (
        (expiresAt - now) / 1000
      ).toFixed(1);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setDescription(
            `⏳ Aguarde ${remaining}s`
          )
      ],
      ephemeral: true
    });
  }
}

timestamps.set(
  interaction.user.id,
  now
);

setTimeout(
  () =>
    timestamps.delete(
      interaction.user.id
    ),
  cooldownMs
);

try {

  await command.execute(
    interaction,
    client
  );

} catch (err) {

  console.error(err);

  if (
    interaction.replied ||
    interaction.deferred
  ) {

    await interaction.followUp({
      content:
        '❌ Erro ao executar comando.',
      ephemeral: true
    }).catch(() => {});

  } else {

    await interaction.reply({
      content:
        '❌ Erro ao executar comando.',
      ephemeral: true
    }).catch(() => {});
   }
 }

}
};
