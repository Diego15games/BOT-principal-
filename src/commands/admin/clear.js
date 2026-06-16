import {
SlashCommandBuilder,
PermissionFlagsBits
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('clear')
.setDescription('Apagar mensagens')
.addIntegerOption(option =>
option
.setName('quantidade')
.setDescription('Quantidade de mensagens')
.setRequired(true)
)
.setDefaultMemberPermissions(
PermissionFlagsBits.ManageMessages
),

async execute(interaction) {

const quantidade =
interaction.options.getInteger(
'quantidade'
);

if (
quantidade < 1 ||
quantidade > 100
) {
return interaction.reply({
content:
'❌ Escolha um valor entre 1 e 100.',
ephemeral: true
});
}

const apagadas =
await interaction.channel.bulkDelete(
quantidade,
true
);

await interaction.reply({
content:
"✅ ${apagadas.size} mensagens apagadas.",
ephemeral: true
});

}
};
