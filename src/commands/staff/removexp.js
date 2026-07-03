import {
SlashCommandBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
removerXP
} from '../../systems/xp.js';

export default {

data: new SlashCommandBuilder()
.setName('removexp')
.setDescription('Remover XP')
.addUserOption(o =>
o.setName('usuario')
.setDescription('Usuário')
.setRequired(true))
.addIntegerOption(o =>
o.setName('xp')
.setDescription('Quantidade')
.setRequired(true))
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

async execute(interaction){

const usuario =
interaction.options.getUser('usuario');

const xp =
interaction.options.getInteger('xp');

await removerXP(
usuario.id,
xp
);

await interaction.reply({
content:`✅ ${xp} XP removido de ${usuario}.`
});

}

};
