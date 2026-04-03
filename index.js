require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
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

// === Keep-alive server ===
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot ativo!'));
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

const TOKEN = process.env.BOT_TOKEN;

client.on('ready', () => {
    console.log(`✅ Logado como ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    // 1. Ignora bots
    if (message.author.bot) return;

    const botMencionado = message.mentions.has(client.user);
    const canalMencionado = message.mentions.channels.size > 0;
    const temPrefixo = message.content.startsWith('!');

    // 2. Só responde se tiver o "!" E marcar o bot E marcar um canal
    if (temPrefixo && botMencionado && canalMencionado) {

        // Opcional: Se você quiser que ele responda APENAS no canal que foi marcado na mensagem:
        const canalAlvo = message.mentions.channels.first();

        // Ajustamos o conteúdo para não bugar os cálculos com as menções
        // Remove as menções de texto para enviar apenas o comando puro para as funções
        const conteudoLimpo = message.content
            .replace(/<@!?\d+>/g, '') // Remove menção de usuário/bot
            .replace(/<#\d+>/g, '')   // Remove menção de canal
            .trim();

        // Criamos um objeto "fake" de mensagem ou apenas passamos o conteúdo limpo
        // Se suas funções rolarDado e calcular usam message.content, 
        // talvez precise dar um "overwrite" temporário:
        const originalContent = message.content;
        message.content = conteudoLimpo;

        // Lógica de comando
        if (conteudoLimpo.startsWith('!')) {
            calcular(message);
        } else {
            rolarDado(message);
        }

        // Restaura o conteúdo original (boa prática)
        message.content = originalContent;

    } else if (temPrefixo) {
        // Opcional: Avisar o usuário que falta marcar o bot/canal
        // message.reply("Para eu responder, você precisa me marcar e marcar o canal!");
    }
});

client.login(TOKEN).catch(err => {
    console.error("⚠️ Erro ao logar o bot:", err);
});