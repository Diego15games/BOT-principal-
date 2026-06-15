import fs from 'fs';

export async function createTranscript(channel) {

const messages = await channel.messages.fetch({
limit: 100
});

const sorted =
[...messages.values()]
.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

let html = `

<!DOCTYPE html><html>
<head>
<meta charset="utf-8">
<title>Transcript</title>
<style>
body{
background:#2b2d31;
color:white;
font-family:Arial;
padding:20px;
}
.message{
background:#1e1f22;
padding:10px;
margin:10px 0;
border-radius:8px;
}
.author{
color:#57f287;
font-weight:bold;
}
.time{
font-size:12px;
color:#999;
}
</style>
</head>
<body><h1>Transcript Ticket</h1>
`;for (const msg of sorted) {

html += `

<div class="message">
<div class="author">${msg.author.tag}</div>
<div class="time">${new Date(msg.createdTimestamp).toLocaleString('pt-BR')}</div>
<div>${msg.content || '(sem texto)'}</div>
</div>
`;
  }html += `

</body>
</html>
`;const path =
"./src/transcripts/${channel.id}.html";

fs.writeFileSync(path, html);

return path;
}