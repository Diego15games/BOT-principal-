import {
SlashCommandBuilder,
PermissionFlagsBits,
MessageFlags
} from 'discord.js';

import {
painelPrincipal
} from '../../panels/painelPrincipal.js';

export default {

data:
new SlashCommandBuilder()

.setName('painel')

.setDescription(
'Painel administrativo'
)

.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

async execute(interaction){

return interaction.reply({

...painelPrincipal(),

flags: MessageFlags.Ephemeral

});

}

};
