function calcular(message) {
    if (!message.content.startsWith('!')) return;

    const conteudo = message.content.slice(1).replace(/\s+/g, '');
    if (conteudo.length === 0) return;

    // limite tamanho da expressão
    if (conteudo.length > 100) {
        return message.reply("❌ Expressão muito longa. Limite de **100 caracteres**.");
    }

    // Segurança de caracteres
    if (!/^[0-9+\-*/().%,]+$/.test(conteudo)) {
        return message.reply("❌ **Erro:** Use apenas números e os símbolos `+ - * / ( ) %`.");
    }

    // limitar números a 20 dígitos
    const numeros = conteudo.match(/\d+/g);
    if (numeros) {
        for (const n of numeros) {
            if (n.length > 20) {
                return message.reply("❌ **Número muito grande!** Limite de **20 dígitos**.");
            }
        }
    }

    let expressao = conteudo.replace(/,/g, '.');

    // --- PORCENTAGEM ---

    // X%Y  -> (X/100)*Y
    expressao = expressao.replace(/(\d+(?:\.\d+)?)%(\d+(?:\.\d+)?)/g, '($1/100)*$2');

    // X% -> (X/100)
    expressao = expressao.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

    try {

        const resultado = eval(expressao);

        if (!isFinite(resultado) || isNaN(resultado)) {
            return message.reply("⚠ O resultado é impossível de calcular.");
        }

        const resultadoFormatado = parseFloat(resultado.toFixed(4));

        message.reply(
            `🧮 **Calculadora**
\`\`\`txt
${conteudo}
= ${resultadoFormatado}
\`\`\``
        );

    } catch (erro) {

        message.reply("⚠ **Expressão inválida!** Verifique os sinais e parênteses.");

    }
}

module.exports = { calcular };