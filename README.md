# BOT-principal

Bot Discord em Node.js com Discord.js v14 e MongoDB. Inclui comandos administrativos, registro, tickets, XP, economia e ferramentas da equipe.

## Requisitos

- Node.js 18.17 ou superior (Node.js 22 recomendado).
- Aplicação e bot criados no [Discord Developer Portal](https://discord.com/developers/applications).
- Banco MongoDB acessível pela hospedagem.

## Configuração local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env`.
3. Preencha `DISCORD_TOKEN` com o token do bot e `MONGO_URI` com a URI do MongoDB.
4. No Discord Developer Portal, habilite **Server Members Intent** e **Message Content Intent** em *Bot > Privileged Gateway Intents*.
5. Convide o bot ao servidor com os escopos `bot` e `applications.commands`, concedendo apenas as permissões necessárias para os recursos que serão usados.
6. Inicie com `npm run start:local`.

## Hospedagem

Configure estas variáveis no painel da hospedagem, sem colocar segredos no código:

- `DISCORD_TOKEN` (obrigatória)
- `MONGO_URI` (obrigatória)
- `PORT` (opcional; usada para o health check HTTP se a plataforma fornecer uma porta)
- `CANAL_COMANDOS_ID` (opcional; use apenas se algum recurso configurado depender dela)

Comando de inicialização: `npm start`.

## Verificação

- `npm run check` verifica a sintaxe de todos os arquivos JavaScript em `src/`.
- O GitHub Actions executa a verificação automaticamente a cada push ou pull request para `main`.
- Uma verificação de sintaxe aprovada **não** confirma que o token, as permissões do Discord, a URI do MongoDB ou cada fluxo de comando funcionam em produção. Faça um teste controlado no servidor depois de configurar a hospedagem.

## Banco de dados

O bot usa o banco `xtbot` dentro do MongoDB. Mantenha uma cópia de segurança antes de alterações manuais nos dados.

## Segurança

- Nunca publique `.env`, tokens do Discord ou credenciais do MongoDB.
- Se um token for exposto, regenere-o no portal oficial.
- Dê ao bot apenas as permissões necessárias.
