import {
SlashCommandBuilder,
PermissionFlagsBits
} from 'discord.js';

import { painelPrincipal } from '../../panels/painelPrincipal.js';

export default {
data: new SlashCommandBuilder()
.setName('painel')
.setDescription('Painel administrativo')
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
async execute(interaction) {
// Mensagem pública: fica fixa no canal e não some como as temporárias.
return interaction.reply({
...painelPrincipal()
});
}
};
