import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { executarBotoesXP } from '../panels/xpButtons.js';
import { pegarConfig, criarRegistro } from '../systems/registro.js';
import { pegarConfigTickets, configurarTickets, assumirTicket, pegarAssumidoPor, removerTicket, isTicketChannel } from '../systems/tickets.js';
import { pegarConfigXP, salvarConfigXP } from '../systems/xp.js';

const privateReply = { flags: MessageFlags.Ephemeral };
function makeModal(id, title, field, label, style = TextInputStyle.Short, oldValue = '') {
  const modal = new ModalBuilder().setCustomId(id).setTitle(title);
  const input = new TextInputBuilder().setCustomId(field).setLabel(label).setStyle(style).setRequired(true).setMaxLength(4000);
  if (oldValue) input.setValue(String(oldValue).slice(0, 4000));
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}
function parsePairs(raw) {
  const result = {};
  for (const line of raw.split(/[\n,;]+/).map(x => x.trim()).filter(Boolean)) {
    const i = line.indexOf('=');
    if (i < 1 || !line.slice(i + 1).trim()) throw new Error('Use o formato chave=valor, uma configuração por linha.');
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    result[key] = /^\d+$/.test(value) ? Number(value) : value;
  }
  return result;
}
export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.reply({ content: '❌ Comando não encontrado.', ...privateReply });
        const seconds = Number(command.cooldown || 0);
        if (seconds > 0) {
          const key = interaction.user.id + ':' + interaction.commandName;
          const expiry = client.cooldowns.get(key);
          if (expiry && expiry > Date.now()) return interaction.reply({ content: '⏳ Aguarde ' + Math.ceil((expiry - Date.now()) / 1000) + ' segundo(s) antes de usar novamente.', ...privateReply });
          client.cooldowns.set(key, Date.now() + seconds * 1000);
        }
        return await command.execute(interaction, client);
      }
      if (interaction.isStringSelectMenu() && interaction.customId === 'xp_config_menu') {
        const options = {
          xp_cargo: ['xp_cargo_modal','XP por Cargo','cargos','ID_CARGO=XP por linha','xpCargo','map'],
          xp_level: ['xp_level_modal','XP para Level','xp','LEVEL=XP por linha','xpLevels','map'],
          cooldown: ['xp_cooldown_modal','Cooldown XP','cooldown','Tempo em segundos','cooldown','number'],
          canais: ['xp_canais_modal','Canais sem XP','canais','IDs separados por vírgula','canaisSemXP','list'],
          cargos: ['xp_cargos_modal','Cargos por Level','cargos','LEVEL=ID_CARGO por linha','cargos','map'],
          canal_level: ['xp_canal_modal','Canal de Level Up','canal','ID do canal','canalLevel','string'],
          msg_level: ['xp_msg_level_modal','Mensagem de Level','mensagem','Use {user} e {level}','mensagemLevel','string'],
          msg_cargo: ['xp_msg_cargo_modal','Mensagem de Cargo','mensagem','Use {user}, {level} e {cargo}','mensagemCargo','string']
        };
        const spec = options[interaction.values[0]];
        if (!spec) return interaction.reply({ content: 'Opção desconhecida.', ...privateReply });
        const cfg = await pegarConfigXP() || {};
        const old = cfg[spec[4]];
        const oldText = old && typeof old === 'object' ? (Array.isArray(old) ? old.join(',') : Object.entries(old).map(([k,v]) => k + '=' + v).join('\n')) : old;
        const style = ['map','list'].includes(spec[5]) || spec[2] === 'mensagem' ? TextInputStyle.Paragraph : TextInputStyle.Short;
        return interaction.showModal(makeModal(spec[0], spec[1], spec[2], spec[3], style, oldText || ''));
      }
      if (interaction.isButton()) {
        if (await executarBotoesXP(interaction)) return;
        if (interaction.customId === 'registro_criar' || interaction.customId === 'registro_atualizar') {
          const modal = new ModalBuilder().setCustomId(interaction.customId === 'registro_criar' ? 'registro_modal' : 'registro_atualizar_modal').setTitle('Registro');
          const nick = new TextInputBuilder().setCustomId('nick').setLabel('Seu nick no jogo').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50);
          const age = new TextInputBuilder().setCustomId('idade').setLabel('Sua idade').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(3);
          modal.addComponents(new ActionRowBuilder().addComponents(nick), new ActionRowBuilder().addComponents(age));
          return interaction.showModal(modal);
        }
        if (interaction.customId === 'painel_principal') { const p = await import('../panels/painelPrincipal.js'); return interaction.update(p.painelPrincipal()); }
        const pageModules = { painel_ticket: '../panels/painelTicket.js', painel_ticket2: '../panels/painelTicket2.js', ticket_pagina2: '../panels/painelTicket2.js', ticket_pagina3: '../panels/painelTicket3.js' };
        if (pageModules[interaction.customId]) { const p = await import(pageModules[interaction.customId]); return interaction.update(Object.values(p).find(x => typeof x === 'function')()); }
        const config = await pegarConfigTickets(interaction.guildId);
        const configButtons = {
          ticket_canal: ['canal','Canal do Painel','ID do canal','panelChannelId'], ticket_categoria: ['categoria','Categoria dos Tickets','ID da categoria','categoryId'],
          ticket_staff: ['staff','Cargo Staff','ID do cargo','staffRoleId'], ticket_logs: ['logs','Canal de Logs','ID do canal','logChannelId'],
          ticket_titulo: ['titulo','Título do Painel','Título','title'], ticket_descricao: ['descricao','Descrição do Painel','Descrição','description'],
          ticket_banner: ['banner','Banner do Painel','URL da imagem','banner'], ticket_cor: ['cor','Cor do Painel','Cor hexadecimal, exemplo #5865F2','color'],
          ticket_botao: ['botao','Texto do Botão','Texto do botão','buttonLabel'], ticket_emoji: ['emoji','Emoji do Botão','Emoji do botão','buttonEmoji']
        };
        if (configButtons[interaction.customId]) {
          const s = configButtons[interaction.customId];
          const isLong = ['descricao'].includes(s[0]);
          return interaction.showModal(makeModal('ticket_config_' + s[0], s[1], s[0], s[2], isLong ? TextInputStyle.Paragraph : TextInputStyle.Short, config && config[s[3]] || ''));
        }
        if (interaction.customId === 'ticket_preview' || interaction.customId === 'ticket_enviar') {
          if (!config?.panelChannelId || !config?.staffRoleId) return interaction.reply({ content: 'Configure o canal do painel e o cargo staff primeiro.', ...privateReply });
          const embed = new EmbedBuilder().setColor(config.color || '#57F287').setTitle(config.title || '🎫 Abrir atendimento').setDescription(config.description || 'Clique no botão abaixo para abrir um ticket.');
          if (config.banner) embed.setImage(config.banner);
          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_abrir').setLabel(config.buttonLabel || 'Abrir Ticket').setEmoji(config.buttonEmoji || '🎫').setStyle(ButtonStyle.Success));
          if (interaction.customId === 'ticket_preview') return interaction.reply({ embeds: [embed], components: [row], ...privateReply });
          const channel = await interaction.guild.channels.fetch(config.panelChannelId).catch(() => null);
          if (!channel?.isTextBased()) return interaction.reply({ content: 'Canal do painel inválido.', ...privateReply });
          await channel.send({ embeds: [embed], components: [row] });
          return interaction.reply({ content: '✅ Painel enviado em ' + channel + '.', ...privateReply });
        }
        if (interaction.customId === 'ticket_abrir') {
          if (!config?.staffRoleId) return interaction.reply({ content: '❌ Configure o sistema de tickets primeiro.', ...privateReply });
          const existing = interaction.guild.channels.cache.find(c => c.topic === 'ticket:' + interaction.user.id);
          if (existing) return interaction.reply({ content: 'Você já tem um ticket aberto: ' + existing, ...privateReply });
          const channel = await interaction.guild.channels.create({
            name: 'ticket-' + interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 85), type: ChannelType.GuildText,
            parent: config.categoryId || undefined, topic: 'ticket:' + interaction.user.id,
            permissionOverwrites: [
              { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
              { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
              { id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] }
            ]
          });
          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_assumir').setLabel('Assumir').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('ticket_chamar_staff').setLabel('Chamar Staff').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('ticket_fechar').setLabel('Fechar Ticket').setStyle(ButtonStyle.Danger));
          await channel.send({ content: '<@' + interaction.user.id + '> <@&' + config.staffRoleId + '> explique seu problema aqui.', components: [row] });
          return interaction.reply({ content: '✅ Ticket criado: ' + channel, ...privateReply });
        }
        if (['ticket_assumir','ticket_chamar_staff','ticket_fechar'].includes(interaction.customId)) {
          if (!isTicketChannel(interaction.channel)) return interaction.reply({ content: 'Este botão só funciona dentro de um ticket.', ...privateReply });
          if (!config?.staffRoleId || !interaction.member.roles?.cache?.has(config.staffRoleId)) return interaction.reply({ content: '❌ Apenas a staff configurada pode usar este botão.', ...privateReply });
          if (interaction.customId === 'ticket_assumir') {
            const claimed = await pegarAssumidoPor(interaction.channel.id);
            if (claimed) return interaction.reply({ content: 'Este ticket já foi assumido por <@' + claimed + '>.', ...privateReply });
            await assumirTicket(interaction.channel.id, interaction.user.id);
            return interaction.reply({ content: '✅ Ticket assumido por ' + interaction.user + '.' });
          }
          if (interaction.customId === 'ticket_chamar_staff') return interaction.reply({ content: '🚨 Staff solicitada por ' + interaction.user + '. <@&' + config.staffRoleId + '>' });
          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_fechar_confirmar').setLabel('Sim, fechar').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId('ticket_fechar_cancelar').setLabel('Não').setStyle(ButtonStyle.Secondary));
          return interaction.reply({ content: 'Tem certeza de que deseja fechar este ticket?', components: [row], ...privateReply });
        }
        if (interaction.customId === 'ticket_fechar_cancelar') return interaction.update({ content: 'Fechamento cancelado.', components: [] });
        if (interaction.customId === 'ticket_fechar_confirmar') {
          if (!isTicketChannel(interaction.channel)) return interaction.reply({ content: 'Canal inválido.', ...privateReply });
          if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) && !interaction.member.roles?.cache?.has(config?.staffRoleId)) return interaction.reply({ content: 'Apenas a staff configurada pode fechar o ticket.', ...privateReply });
          await interaction.update({ content: '🔒 Ticket será fechado em alguns segundos.', components: [] });
          if (config?.logChannelId) { const log = await interaction.guild.channels.fetch(config.logChannelId).catch(() => null); if (log?.isTextBased()) await log.send('Ticket #' + interaction.channel.name + ' fechado por ' + interaction.user + '.').catch(() => {}); }
          await removerTicket(interaction.channel.id).catch(() => {});
          setTimeout(() => interaction.channel.delete().catch(() => {}), 2500);
          return;
        }
        return;
      }
      if (interaction.isModalSubmit()) {
        const xpFields = {
          xp_cargo_modal: ['cargos','xpCargo','map'], xp_level_modal: ['xp','xpLevels','map'], xp_cooldown_modal: ['cooldown','cooldown','number'],
          xp_canais_modal: ['canais','canaisSemXP','list'], xp_cargos_modal: ['cargos','cargos','map'], xp_canal_modal: ['canal','canalLevel','string'],
          xp_msg_level_modal: ['mensagem','mensagemLevel','string'], xp_msg_cargo_modal: ['mensagem','mensagemCargo','string']
        };
        if (xpFields[interaction.customId]) {
          const spec = xpFields[interaction.customId]; const raw = interaction.fields.getTextInputValue(spec[0]).trim(); let value = raw; const cfg = await pegarConfigXP() || {};
          if (spec[2] === 'number') { value = Number(raw); if (!Number.isInteger(value) || value < 0 || value > 86400) return interaction.reply({ content: 'Informe um número inteiro entre 0 e 86400 segundos.', ...privateReply }); }
          if (spec[2] === 'map') { try { value = parsePairs(raw); } catch (e) { return interaction.reply({ content: '❌ ' + e.message, ...privateReply }); } }
          if (spec[2] === 'list') value = raw.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
          cfg[spec[1]] = value; await salvarConfigXP(cfg); return interaction.reply({ content: '✅ Configuração de XP salva.', ...privateReply });
        }
        if (interaction.customId.startsWith('ticket_config_')) {
          const field = interaction.customId.slice('ticket_config_'.length);
          const keys = { canal: 'panelChannelId', categoria: 'categoryId', staff: 'staffRoleId', logs: 'logChannelId', titulo: 'title', descricao: 'description', banner: 'banner', cor: 'color', botao: 'buttonLabel', emoji: 'buttonEmoji' };
          const key = keys[field]; if (!key) return;
          const raw = interaction.fields.getTextInputValue(field).trim();
          if (['canal','categoria','staff','logs'].includes(field) && !/^\d{17,20}$/.test(raw)) return interaction.reply({ content: 'Informe um ID válido do Discord.', ...privateReply });
          if (field === 'banner' && !/^https?:\/\//i.test(raw)) return interaction.reply({ content: 'Informe uma URL http ou https válida.', ...privateReply });
          if (field === 'cor' && !/^#?[0-9a-f]{6}$/i.test(raw)) return interaction.reply({ content: 'Use uma cor hexadecimal, exemplo #5865F2.', ...privateReply });
          await configurarTickets({ guildId: interaction.guildId, [key]: field === 'cor' ? (raw.startsWith('#') ? raw : '#' + raw) : raw });
          return interaction.reply({ content: '✅ Configuração salva.', ...privateReply });
        }
        if (interaction.customId === 'registro_modal' || interaction.customId === 'registro_atualizar_modal') {
          const nick = interaction.fields.getTextInputValue('nick').trim(); const age = Number(interaction.fields.getTextInputValue('idade').trim());
          if (!nick || !Number.isInteger(age) || age < 1 || age > 120) return interaction.reply({ content: '❌ Informe um nick válido e uma idade entre 1 e 120.', ...privateReply });
          await criarRegistro(interaction.user.id, { nick, idade: age, atualizadoEm: new Date() }); const cfg = await pegarConfig();
          if (cfg?.cargoRegistrado && interaction.guild) { const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null); if (member) { await member.roles.add(cfg.cargoRegistrado).catch(() => {}); if (cfg.cargoNaoRegistrado) await member.roles.remove(cfg.cargoNaoRegistrado).catch(() => {}); } }
          return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('✅ Registro salvo').setDescription('Nick: **' + nick + '**\nIdade: **' + age + '**')], ...privateReply });
        }
      }
    } catch (error) {
      console.error('Erro em interactionCreate:', error);
      const payload = { content: '❌ Ocorreu um erro ao processar esta interação.', ...privateReply };
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => {}); else await interaction.reply(payload).catch(() => {});
    }
  }
};