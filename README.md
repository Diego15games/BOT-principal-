# BOT-principal

Bot Discord para gerenciamento de servidor (registro, tickets, XP, economia, staff).

## Como rodar

1. `npm install`
2. Configure as variáveis de ambiente (veja `.env.example`):
   - `DISCORD_TOKEN`
   - `MONGO_URI`
   - `CANAL_COMANDOS_ID` (opcional)
3. `npm start` (em hospedagem) ou `npm run start:local` (lê o arquivo `.env`)

Todos os dados ficam no MongoDB (banco `xtbot`).
