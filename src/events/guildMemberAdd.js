export default {
name: 'guildMemberAdd',

async execute(member) {

const canal =
member.guild.systemChannel;

if (!canal) return;

await canal.send(
"🎉 Bem-vindo ${member} ao servidor!"
);

}
};
