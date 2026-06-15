import fs from 'fs';

const PATH =
'./database/ticketConfig.json';

export function getLogsChannel(client) {

try {

const config =
  JSON.parse(
    fs.readFileSync(PATH, 'utf8')
  );

if (!config.logsId) return null;

return client.channels.cache.get(
  config.logsId
);

} catch {

return null;

}
}