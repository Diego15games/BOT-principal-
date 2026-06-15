export default {
name: 'ready',
once: true,

async execute(client) {

console.log(
  `✅ Online como ${client.user.tag}`
);

}
};