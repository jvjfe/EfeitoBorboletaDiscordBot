require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const { rolarDado } = require('./dado'); // Importa a função do dado.js
const { calcular } = require('./calculadora'); // Importa a nova função da calculadora

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// === Keep-alive server (UptimeRobot) ===
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot ativo!'));
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// === Token do bot ===
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
    console.error("⚠️ Token do bot não encontrado!");
    process.exit(1);
}

// === Eventos do bot ===
client.on('ready', () => { // Corrigido de 'clientReady' para 'ready'
    console.log(`✅ Logado como ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    // Se começar com !, foca na calculadora
    if (message.content.startsWith('!')) {
        calcular(message);
    } else {
        // Caso contrário, tenta rodar os dados
        rolarDado(message);
    }
});

// === Login do bot ===
client.login(TOKEN).catch(err => {
    console.error("⚠️ Erro ao logar o bot. Verifique o token:", err);
});