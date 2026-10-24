import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { executarBotoesXP } from '../panels/xpButtons.js';
import { pegarConfig, criarRegistro, salvarConfig } from '../systems/registro.js';
import { pegarConfigTickets, configurarTickets, assumirTicket, pegarAssumidoPor, removerTicket, isTicketChannel } from '../systems/tickets.js';
import { pegarConfigXP, salvarConfigXP } from '../systems/xp.js';
import { salvarConfigStaff } from '../systems/staff.js';
import { db } from '../systems/database.js';
const serverConfigCollection = db.collection('serverConfig');

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
    result[key] = value;
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
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Você precisa da permissão Gerenciar Servidor para configurar o XP.', ...privateReply });
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
        const cfg = await pegarConfigXP() || {}; delete cfg._id;
        const old = cfg[spec[4]];
        const oldText = old && typeof old === 'object' ? (Array.isArray(old) ? old.join(',') : Object.entries(old).map(([k,v]) => k + '=' + v).join('\n')) : old;
        const style = ['map','list'].includes(spec[5]) || spec[2] === 'mensagem' ? TextInputStyle.Paragraph : TextInputStyle.Short;
        return interaction.showModal(makeModal(spec[0], spec[1], spec[2], spec[3], style, oldText || ''));
      }
      if (interaction.isButton()) {
        if (interaction.customId.startsWith('xp_') && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Você precisa da permissão Gerenciar Servidor para configurar o XP.', ...privateReply });
        if ((interaction.customId.startsWith('ticket_') && !['ticket_abrir','ticket_assumir','ticket_chamar_staff','ticket_fechar','ticket_fechar_confirmar','ticket_fechar_cancelar'].includes(interaction.customId) || interaction.customId.startsWith('registro_') && !['registro_criar','registro_atualizar'].includes(interaction.customId) || interaction.customId.startsWith('staff_') || interaction.customId.startsWith('geral_')) && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Você precisa da permissão Gerenciar Servidor para alterar o painel de tickets.', ...privateReply });
        if (await executarBotoesXP(interaction)) return;
        if (interaction.customId === 'registro_criar' || interaction.customId === 'registro_atualizar') {
          const modal = new ModalBuilder().setCustomId(interaction.customId === 'registro_criar' ? 'registro_modal' : 'registro_atualizar_modal').setTitle('Registro');
          const nick = new TextInputBuilder().setCustomId('nick').setLabel('Seu nick no jogo').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50);
          const age = new TextInputBuilder().setCustomId('idade').setLabel('Sua idade').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(3);
          modal.addComponents(new ActionRowBuilder().addComponents(nick), new ActionRowBuilder().addComponents(age));
          return interaction.showModal(modal);
        }
        if (interaction.customId === 'registro_preview' || interaction.customId === 'registro_enviar') {
          const cfg = await pegarConfig();
          if (!cfg?.canal || !cfg?.cargoRegistrado || !cfg?.cargoNaoRegistrado) return interaction.reply({ content: 'Configure os cargos e o canal do registro primeiro.', ...privateReply });
          const embed = new EmbedBuilder().setColor(cfg.cor || '#5865F2').setTitle(cfg.titulo || '📝 Registro').setDescription(cfg.descricao || 'Clique abaixo para registrar-se.');
          if (cfg.banner) embed.setImage(cfg.banner);
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('registro_criar').setLabel(cfg.botaoRegistrar || 'Registrar-se').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('registro_atualizar').setLabel(cfg.botaoAtualizar || 'Atualizar Registro').setStyle(ButtonStyle.Primary)
          );
          if (interaction.customId === 'registro_preview') return interaction.reply({ embeds: [embed], components: [row], ...privateReply });
          const channel = await interaction.guild.channels.fetch(cfg.canal).catch(() => null);
          if (!channel?.isTextBased()) return interaction.reply({ content: 'Canal de registro inválido.', ...privateReply });
          await channel.send({ embeds: [embed], components: [row] });
          return interaction.reply({ content: '✅ Painel de registro enviado em ' + channel + '.', ...privateReply });
        }
        const registroButtons = {
          registro_cargo: ['cargo','Cargo Registrado','ID do cargo','cargoRegistrado'],
          registro_nao: ['nao','Cargo Não Registrado','ID do cargo','cargoNaoRegistrado'],
          registro_canal: ['canal','Canal do Registro','ID do canal','canal'],
          registro_logs: ['logs','Canal de Logs','ID do canal','canalLogs'],
          registro_titulo: ['titulo','Título do Painel','Título','titulo'],
          registro_descricao: ['descricao','Descrição do Painel','Descrição','descricao'],
          registro_banner: ['banner','Banner do Painel','URL da imagem','banner'],
          registro_cor: ['cor','Cor do Painel','Cor hexadecimal, exemplo #5865F2','cor'],
          registro_msg: ['msg','Mensagem de Sucesso','Use {user} e {nick}','mensagemSucesso'],
          registro_botao_registrar: ['botao_registrar','Botão Registrar','Texto do botão','botaoRegistrar'],
          registro_botao_atualizar: ['botao_atualizar','Botão Atualizar','Texto do botão','botaoAtualizar']
        };
        if (registroButtons[interaction.customId]) {
          const s = registroButtons[interaction.customId];
          const cfg = await pegarConfig() || {};
          const style = ['descricao','msg'].includes(s[0]) ? TextInputStyle.Paragraph : TextInputStyle.Short;
          return interaction.showModal(makeModal('registro_config_' + s[0], s[1], s[0], s[2], style, cfg[s[3]] || ''));
        }
        if (interaction.customId === 'painel_principal') { const p = await import('../panels/painelPrincipal.js'); return interaction.update(p.painelPrincipal()); }
        const pageModules = { painel_xp: '../panels/painelXP.js', painel_registro: '../panels/painelRegistro.js', painel_registro2: '../panels/painelRegistro2.js', painel_staff: '../panels/painelStaff.js', painel_geral: '../panels/painelGeral.js', painel_ticket: '../panels/painelTicket.js', painel_ticket2: '../panels/painelTicket2.js', ticket_pagina2: '../panels/painelTicket2.js', ticket_pagina3: '../panels/painelTicket3.js', registro_pagina2: '../panels/painelRegistro2.js', registro_pagina3: '../panels/painelRegistro3.js', painel_registro3: '../panels/painelRegistro3.js' };
        if (pageModules[interaction.customId]) { const p = await import(pageModules[interaction.customId]); return interaction.update(Object.values(p).find(x => typeof x === 'function')()); }
        const staffButtons = { staff_mod: ['modRoleId', 'Cargo Moderador'], staff_admin: ['adminRoleId', 'Cargo Administrador'], staff_dono: ['ownerRoleId', 'Cargo Fundador'], staff_logs: ['logChannelId', 'Canal de Logs da Staff'] };
        if (staffButtons[interaction.customId]) {
          const [key, label] = staffButtons[interaction.customId];
          return interaction.showModal(makeModal('staff_config_' + key, label, 'valor', 'ID do cargo ou canal'));
        }
        const generalButtons = { geral_logs: ['logChannelId', 'Canal de Logs'], geral_boasvindas: ['welcomeChannelId', 'Canal de Boas-vindas'], geral_saida: ['leaveChannelId', 'Canal de Saída'], geral_cor: ['embedColor', 'Cor dos Embeds'] };
        if (generalButtons[interaction.customId]) {
          const [key, label] = generalButtons[interaction.customId];
          return interaction.showModal(makeModal('geral_config_' + key, label, 'valor', key === 'embedColor' ? 'Cor hexadecimal, exemplo #5865F2' : 'ID do canal'));
        }
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
          if (!interaction.guild) return interaction.reply({ content: '❌ Este botão só funciona dentro de um servidor.', ...privateReply });
          if (!config?.staffRoleId) return interaction.reply({ content: '❌ Configure o sistema de tickets primeiro.', ...privateReply });
          const modal = new ModalBuilder().setCustomId('ticket_abertura_modal').setTitle('Abrir atendimento');
          const nick = new TextInputBuilder().setCustomId('ticket_nick').setLabel('Seu nick').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50);
          const problema = new TextInputBuilder().setCustomId('ticket_problema').setLabel('Tipo de problema').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100);
          const descricao = new TextInputBuilder().setCustomId('ticket_descricao').setLabel('Descreva o problema').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000);
          modal.addComponents(new ActionRowBuilder().addComponents(nick), new ActionRowBuilder().addComponents(problema), new ActionRowBuilder().addComponents(descricao));
          return interaction.showModal(modal);
        }
        if (['ticket_assumir','ticket_chamar_staff','ticket_fechar'].includes(interaction.customId)) {
          if (!isTicketChannel(interaction.channel)) return interaction.reply({ content: 'Este botão só funciona dentro de um ticket.', ...privateReply });
          if (!config?.staffRoleId || !interaction.member.roles?.cache?.has(config.staffRoleId)) return interaction.reply({ content: '❌ Apenas a staff configurada pode usar este botão.', ...privateReply });
          if (interaction.customId === 'ticket_assumir') {
            const claimed = await pegarAssumidoPor(interaction.channel.id);
            if (claimed) return interaction.reply({ content: 'Este ticket já foi assumido por <@' + claimed + '>.', ...privateReply });
            const dono = await assumirTicket(interaction.channel.id, interaction.user.id);
            if (dono) return interaction.reply({ content: 'Este ticket já foi assumido por <@' + dono + '>.', ...privateReply });
            const logId = config.logChannelId || config.ticketLogs;
            const log = logId ? await interaction.guild.channels.fetch(logId).catch(() => null) : null;
            if (log?.isTextBased()) await log.send({ content: '🧑‍💼 Ticket ' + interaction.channel + ' assumido por ' + interaction.user + '.' }).catch(() => {});
            return interaction.reply({ content: '✅ Ticket assumido por ' + interaction.user + '.' });
          }
          if (interaction.customId === 'ticket_chamar_staff') {
            const logId = config.logChannelId || config.ticketLogs;
            const log = logId ? await interaction.guild.channels.fetch(logId).catch(() => null) : null;
            if (log?.isTextBased()) await log.send({ content: '🚨 Staff chamada no ticket ' + interaction.channel + ' por ' + interaction.user + '.' }).catch(() => {});
            return interaction.reply({ content: '🚨 Staff solicitada por ' + interaction.user + '. <@&' + config.staffRoleId + '>' });
          }
          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_fechar_confirmar').setLabel('Sim, fechar').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId('ticket_fechar_cancelar').setLabel('Não').setStyle(ButtonStyle.Secondary));
          return interaction.reply({ content: 'Tem certeza de que deseja fechar este ticket?', components: [row], ...privateReply });
        }
        if (interaction.customId === 'ticket_fechar_cancelar') return interaction.update({ content: 'Fechamento cancelado.', components: [] });
        if (interaction.customId === 'ticket_fechar_confirmar') {
          if (!isTicketChannel(interaction.channel)) return interaction.reply({ content: 'Canal inválido.', ...privateReply });
          if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) && !interaction.member.roles?.cache?.has(config?.staffRoleId)) return interaction.reply({ content: 'Apenas a staff configurada pode fechar o ticket.', ...privateReply });
          await interaction.update({ content: '🔒 Ticket será fechado em alguns segundos.', components: [] });
          // A resposta já foi enviada pela interação; gerar transcript e registrar sem responder novamente.
          try {
            const { gerarTranscript } = await import('../systems/transcript.js');
            const arquivo = await gerarTranscript(interaction.channel);
            const logId = config?.logChannelId || config?.ticketLogs;
            const log = logId ? await interaction.guild.channels.fetch(logId).catch(() => null) : null;
            if (log?.isTextBased()) {
              await log.send({ content: '📋 Transcript de #' + interaction.channel.name + ' (fechado por ' + interaction.user + ')', ...(arquivo ? { files: [arquivo] } : {}) });
            }
          } catch (err) { console.error('Erro ao registrar transcript do ticket:', err); }
          await removerTicket(interaction.channel.id).catch(() => {});
          setTimeout(() => interaction.channel.delete().catch(() => {}), 2500);
          return;
        }
        return;
      }
      if (interaction.isModalSubmit()) {
        if ((interaction.customId.startsWith('xp_') || interaction.customId.startsWith('ticket_config_') || interaction.customId.startsWith('staff_config_') || interaction.customId.startsWith('geral_config_')) && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Você não tem permissão para alterar estas configurações.', ...privateReply });
        const xpFields = {
          xp_cargo_modal: ['cargos','xpCargo','map'], xp_level_modal: ['xp','xpLevels','map'], xp_cooldown_modal: ['cooldown','cooldown','number'],
          xp_canais_modal: ['canais','canaisSemXP','list'], xp_cargos_modal: ['cargos','cargos','map'], xp_canal_modal: ['canal','canalLevel','string'],
          xp_msg_level_modal: ['mensagem','mensagemLevel','string'], xp_msg_cargo_modal: ['mensagem','mensagemCargo','string']
        };
        if (xpFields[interaction.customId]) {
          const spec = xpFields[interaction.customId]; const raw = interaction.fields.getTextInputValue(spec[0]).trim(); let value = raw; const cfg = await pegarConfigXP() || {}; delete cfg._id;
          if (spec[2] === 'number') { value = Number(raw); if (!Number.isInteger(value) || value < 0 || value > 86400) return interaction.reply({ content: 'Informe um número inteiro entre 0 e 86400 segundos.', ...privateReply }); }
          if (spec[2] === 'map') { try { value = parsePairs(raw); if (spec[1] !== 'cargos') value = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, Number(v)])); } catch (e) { return interaction.reply({ content: '❌ ' + e.message, ...privateReply }); } }
          if (spec[2] === 'list') value = raw.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
          cfg[spec[1]] = value; await salvarConfigXP(cfg); return interaction.reply({ content: '✅ Configuração de XP salva.', ...privateReply });
        }
        if (interaction.customId.startsWith('staff_config_')) {
          const key = interaction.customId.slice('staff_config_'.length);
          const allowed = ['modRoleId', 'adminRoleId', 'ownerRoleId', 'logChannelId'];
          if (!allowed.includes(key)) return interaction.reply({ content: 'Configuração inválida.', ...privateReply });
          const value = interaction.fields.getTextInputValue('valor').trim();
          if (!/^\d{17,20}$/.test(value)) return interaction.reply({ content: 'Informe um ID válido do Discord.', ...privateReply });
          const current = await db.collection('staffConfig').findOne({ guildId: interaction.guildId }) || {}; delete current._id;
          await salvarConfigStaff({ ...current, guildId: interaction.guildId, [key]: value });
          return interaction.reply({ content: '✅ Configuração da staff salva.', ...privateReply });
        }
        if (interaction.customId.startsWith('geral_config_')) {
          const key = interaction.customId.slice('geral_config_'.length);
          const allowed = ['logChannelId', 'welcomeChannelId', 'leaveChannelId', 'embedColor'];
          const value = interaction.fields.getTextInputValue('valor').trim();
          if (!allowed.includes(key)) return interaction.reply({ content: 'Configuração inválida.', ...privateReply });
          if (key === 'embedColor' && !/^#?[0-9a-f]{6}$/i.test(value)) return interaction.reply({ content: 'Use uma cor hexadecimal, exemplo #5865F2.', ...privateReply });
          if (key !== 'embedColor' && !/^\d{17,20}$/.test(value)) return interaction.reply({ content: 'Informe um ID válido do Discord.', ...privateReply });
          const saved = key === 'embedColor' && !value.startsWith('#') ? '#' + value : value;
          await serverConfigCollection.updateOne({ guildId: interaction.guildId }, { $set: { guildId: interaction.guildId, [key]: saved } }, { upsert: true });
          return interaction.reply({ content: '✅ Configuração geral salva.', ...privateReply });
        }
        if (interaction.customId === 'ticket_abertura_modal') {
          if (!interaction.guild) return interaction.reply({ content: '❌ Este formulário só funciona dentro de um servidor.', ...privateReply });
          const config = await pegarConfigTickets(interaction.guildId);
          if (!config?.staffRoleId) return interaction.reply({ content: '❌ Configure o sistema de tickets primeiro.', ...privateReply });
          const nick = interaction.fields.getTextInputValue('ticket_nick').trim();
          const problema = interaction.fields.getTextInputValue('ticket_problema').trim();
          const descricao = interaction.fields.getTextInputValue('ticket_descricao').trim();
          if (!nick || !problema || !descricao) return interaction.reply({ content: 'Preencha todos os campos do formulário.', ...privateReply });
          await interaction.deferReply({ ...privateReply });
          const guildChannels = await interaction.guild.channels.fetch();
          const existing = guildChannels.find(c => c.topic === 'ticket:' + interaction.user.id);
          if (existing) return interaction.editReply({ content: 'Você já tem um ticket aberto: ' + existing });
          let categoryId;
          if (config.categoryId) {
            const category = await interaction.guild.channels.fetch(config.categoryId).catch(() => null);
            if (category && category.type === ChannelType.GuildCategory) categoryId = category.id;
          }
          const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80) || 'usuario';
          const channel = await interaction.guild.channels.create({
            name: 'ticket-' + safeName, type: ChannelType.GuildText,
            parent: categoryId, topic: 'ticket:' + interaction.user.id,
            permissionOverwrites: [
              { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
              { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages] },
              { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
              { id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] }
            ]
          });
          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_assumir').setLabel('Assumir').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('ticket_chamar_staff').setLabel('Chamar Staff').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('ticket_fechar').setLabel('Fechar Ticket').setStyle(ButtonStyle.Danger));
          const embed = new EmbedBuilder().setColor(config.color || '#57F287').setTitle('🎫 Novo atendimento').addFields(
            { name: 'Usuário', value: interaction.user.toString(), inline: true },
            { name: 'Nick', value: nick.slice(0, 1024), inline: true },
            { name: 'Problema', value: problema.slice(0, 1024), inline: true },
            { name: 'Descrição', value: descricao.slice(0, 1024) }
          ).setTimestamp();
          await channel.send({ content: '<@' + interaction.user.id + '> <@&' + config.staffRoleId + '>', embeds: [embed], components: [row] });
          const logId = config.logChannelId || config.ticketLogs;
          const log = logId ? await interaction.guild.channels.fetch(logId).catch(() => null) : null;
          if (log?.isTextBased()) await log.send({ content: '🎫 Ticket criado: ' + channel + ' por ' + interaction.user + ' | Problema: ' + problema.slice(0, 500) }).catch(() => {});
          return interaction.editReply({ content: '✅ Ticket criado: ' + channel });
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
        if (interaction.customId.startsWith('registro_config_')) {
          const field = interaction.customId.slice('registro_config_'.length);
          const keys = { cargo: 'cargoRegistrado', nao: 'cargoNaoRegistrado', canal: 'canal', logs: 'canalLogs', titulo: 'titulo', descricao: 'descricao', banner: 'banner', cor: 'cor', msg: 'mensagemSucesso', botao_registrar: 'botaoRegistrar', botao_atualizar: 'botaoAtualizar' };
          const key = keys[field];
          if (!key) return;
          const raw = interaction.fields.getTextInputValue(field).trim();
          if (['cargo','nao','canal','logs'].includes(field) && !/^\d{17,20}$/.test(raw)) return interaction.reply({ content: 'Informe um ID válido do Discord.', ...privateReply });
          if (field === 'banner' && !/^https?:\/\//i.test(raw)) return interaction.reply({ content: 'Informe uma URL http ou https válida.', ...privateReply });
          if (field === 'cor' && !/^#?[0-9a-f]{6}$/i.test(raw)) return interaction.reply({ content: 'Use uma cor hexadecimal, exemplo #5865F2.', ...privateReply });
          const registroConfig = await pegarConfig() || {}; delete registroConfig._id;
          await salvarConfig({ ...registroConfig, [key]: field === 'cor' ? (raw.startsWith('#') ? raw : '#' + raw) : raw });
          return interaction.reply({ content: '✅ Configuração do registro salva.', ...privateReply });
        }
        if (interaction.customId === 'registro_modal' || interaction.customId === 'registro_atualizar_modal') {
          const nick = interaction.fields.getTextInputValue('nick').trim(); const age = Number(interaction.fields.getTextInputValue('idade').trim());
          if (!nick || !Number.isInteger(age) || age < 1 || age > 120) return interaction.reply({ content: '❌ Informe um nick válido e uma idade entre 1 e 120.', ...privateReply });
          await criarRegistro(interaction.user.id, { nick, idade: age, atualizadoEm: new Date() }); const cfg = await pegarConfig();
          if (cfg?.cargoRegistrado && interaction.guild) { const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null); if (member) { await member.roles.add(cfg.cargoRegistrado).catch(() => {}); if (cfg.cargoNaoRegistrado) await member.roles.remove(cfg.cargoNaoRegistrado).catch(() => {}); } }
          const mensagem = (cfg?.mensagemSucesso || '✅ Registro salvo para {user}! Nick: **{nick}**').replaceAll('{user}', `${interaction.user}`).replaceAll('{nick}', nick).replaceAll('{idade}', String(age));
          return interaction.reply({ content: mensagem, ...privateReply });
        }
      }
    } catch (error) {
      console.error('Erro em interactionCreate:', error);
      const payload = { content: '❌ Ocorreu um erro ao processar esta interação.', ...privateReply };
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => {}); else await interaction.reply(payload).catch(() => {});
    }
  }
};