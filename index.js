require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const express = require('express');
const { rolarDado } = require('./dado');
const { calcular } = require('./calculadora');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Variável para armazenar o canal permitido (em memória)
let canalPermitidoId = null;

// === Keep-alive server ===
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot ativo!'));
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

client.on('ready', () => {
    console.log(`✅ Logado como ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    // --- COMANDO DE CONFIGURAÇÃO ---
    // Exemplo: !config #canal-de-dados
    if (message.content.startsWith('!config')) {
        // Verifica se o usuário tem permissão de Administrador para não qualquer um zoar o bot
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Apenas administradores podem configurar o canal.");
        }

        const canalMencionado = message.mentions.channels.first();

        if (!canalMencionado) {
            return message.reply("⚠️ Use: `!config #nome-do-canal` para definir onde posso falar.");
        }

        canalPermitidoId = canalMencionado.id;
        return message.reply(`✅ Configurado! Agora só responderei no canal ${canalMencionado}.`);
    }

    // --- FILTRO DE CANAL ---
    // Se o canal não estiver configurado, ele ignora tudo (exceto o próprio !config)
    if (!canalPermitidoId) return;

    // Se a mensagem NÃO for do canal permitido, o bot fica mudo
    if (message.channel.id !== canalPermitidoId) return;

    // --- LÓGICA DOS COMANDOS (CALCULADORA E DADOS) ---
    if (message.content.startsWith('!')) {
        calcular(message);
    } else {
        rolarDado(message);
    }
});

client.login(process.env.BOT_TOKEN).catch(err => {
    console.error("⚠️ Erro ao logar o bot:", err);
});