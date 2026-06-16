export default {
name: 'messageCreate',

async execute(message) {

if (message.author.bot) return;

if (
message.content.toLowerCase() === 'ping'
) {
await message.reply('🏓 Pong!');
}

}
};
