import fs from 'fs';

const CONFIG_PATH = './database/xpConfig.json';

export async function pegarConfigXP() {

try {

return JSON.parse(
fs.readFileSync(CONFIG_PATH, 'utf8')
);

} catch {

return {
xpCargo: {},
xpLevels: {},
cargos: {},
canaisSemXP: [],
cooldown: 60,
canalLevel: null,
mensagemLevel:
'🎉 {user} subiu para o nível {level}!',
mensagemCargo:
'🏆 {user} recebeu o cargo {cargo}!'
};

}

}

export async function salvarConfigXP(config) {

fs.writeFileSync(
CONFIG_PATH,
JSON.stringify(config, null, 2)
);

}
