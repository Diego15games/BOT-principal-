import {
SlashCommandBuilder,
PermissionFlagsBits
} from 'discord.js';

import {
definirLevel
} from '../../systems/xp.js';

export default {

data: new SlashCommandBuilder()
.setName('setlevel')
.setDescription('Definir nível')
.addUserOption(o =>
o.setName('usuario')
.setDescription('Usuário')
.setRequired(true))
.addIntegerOption(o =>
o.setName('level')
.setDescription('Novo nível')
.setRequired(true))
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

async execute(interaction){

const usuario =
interaction.options.getUser('usuario');

const level =
interaction.options.getInteger('level');

await definirLevel(
usuario.id,
level
);

await interaction.reply({
content:`✅ ${usuario} agora está no nível ${level}.`
});

}

};
