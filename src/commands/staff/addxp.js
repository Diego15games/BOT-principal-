import {
SlashCommandBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
adicionarXP
} from '../../systems/xp.js';

export default {

data: new SlashCommandBuilder()
.setName('addxp')
.setDescription('Adicionar XP')
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

await adicionarXP(
usuario.id,
xp
);

await interaction.reply({
content:`✅ ${xp} XP adicionado para ${usuario}.`
});

}

};
