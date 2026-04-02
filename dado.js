function rolarDado(message) {
    const ELEMENTOS = {
        fenda: "🔵",
        musculo: "🔴",
        tempo: "🟣",
        pressa: "🟡",
        sombra: "⚫",
        luz: "⚪"
    };

    const conteudoOriginal = message.content.trim().toLowerCase();

    // CORREÇÃO 1: Ignora a mensagem se não houver um formato real de dado (ex: barra "1d" solto)
    if (!/\d+#?d\d+/i.test(conteudoOriginal)) return;

    // CORREÇÃO 2: Separa em pedaços pegando dados, palavras (para os elementos), números e operadores
    const regex = /(\d+#?d\d+)|([a-zçãõáéíóú]+)|(\d+)|([+\-*/])/g;
    const tokens = conteudoOriginal.match(regex);
    if (!tokens) return;

    let totalDados = 0;
    let totalFinal = 0;
    const detalhes = [];
    let expressao = [];
    let possuiOperador = false;

    // Usamos um for loop clássico para poder "espiar" o próximo item (o elemento)
    for (let index = 0; index < tokens.length; index++) {
        let token = tokens[index];

        // Se for um token de dado
        if (token.includes('d') && !/^[a-z]+$/.test(token)) {
            let explode = false;
            let quantidadeStr, dadoStr;

            if (token.includes('#')) {
                explode = true;
                const partes = token.split('#');
                quantidadeStr = partes[0];
                dadoStr = partes[1].replace('d', '');
            } else {
                [quantidadeStr, dadoStr] = token.split('d');
            }

            const quantidade = parseInt(quantidadeStr);
            const dado = parseInt(dadoStr);

            if (!quantidade || !dado) continue;

            // CORREÇÃO 3 (Parte A): Previne o travamento do bot limitando a quantidade de dados por vez
            if (quantidade > 200) {
                return message.reply("⚠ Você só pode rolar até 200 dados de uma vez para evitar lag!");
            }

            // CORREÇÃO 2 (Continuação): Verifica se o PRÓXIMO token é um elemento válido
            let emojiAtual = "";
            if (index + 1 < tokens.length && ELEMENTOS[tokens[index + 1]]) {
                emojiAtual = ` ${ELEMENTOS[tokens[index + 1]]}`;
                index++; // Avança o index para pular a palavra do elemento na próxima rodada do loop
            }

            const resultados = [];
            let soma = 0;

            for (let i = 0; i < quantidade; i++) {
                const r = Math.floor(Math.random() * dado) + 1;
                resultados.push(r); // guarda número puro
                soma += r;
            }

            // ordena do maior para o menor APENAS se não for explode
            if (!explode) {
                resultados.sort((a, b) => b - a);
            }

            // aplica destaque de crítico
            const resultadosFormatados = resultados.map(r =>
                r === dado ? `**${r}**` : r
            );

            totalDados += soma;
            totalFinal += soma;
            expressao.push(soma);

            // Monta os detalhes com o emoji específico desse dado
            if (explode) {
                resultados.forEach(r => {
                    const valor = r.toString().replace(/\*\*/g, '');
                    detalhes.push(`\`\`${valor}\`\` ⟵ [${valor}] 1d${dado}${emojiAtual}`);
                });
            } else {
                detalhes.push(`[${resultadosFormatados.join(', ')}] ${quantidade}d${dado}${emojiAtual}`);
            }
        }
        else if (/[+\-*/]/.test(token)) {
            expressao.push(token);
            detalhes.push(token);
            possuiOperador = true;
        }
        else if (!isNaN(token) && token.trim() !== '') {
            const numero = parseInt(token);
            totalFinal += numero;
            expressao.push(numero);
            detalhes.push(numero);
        }
    }

    if (expressao.length === 0) return;

    let resultadoFinal;
    try {
        resultadoFinal = eval(expressao.join(''));
    } catch {
        resultadoFinal = 'Erro';
    }

    let resposta;
    if (possuiOperador) {
        resposta = `\`\`${resultadoFinal}\`\` ⟵ ${totalDados}${totalFinal !== totalDados ? ` + ${totalFinal - totalDados}` : ''}\n` + detalhes.join(' ');
    } else {
        resposta = `\`\`${resultadoFinal}\`\`\n` + detalhes.join('\n');
    }

    // CORREÇÃO 3 (Parte B): O limite do Discord é de 2000 caracteres. Cortamos em 1900 por segurança.
    if (resposta.length > 1900) {
        resposta = resposta.slice(0, 900) + "\n...\n*(resultado muito grande)*";
    }

    message.reply(resposta);
}

module.exports = { rolarDado };