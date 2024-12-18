const { saudacao } = require('./funcao_saudacao.js');
const { fimDeSemana } = require('./funcao_fim_de_semana.js');

async function processarSaudacao(message,menuEnviado) {
    const fimDeSemanaMensagem = fimDeSemana();
    if (fimDeSemanaMensagem === '') {
        const chat = await message.getChat();
        const contact = await message.getContact();
        const name = contact.pushname || "Cliente";
        await chat.sendStateTyping();
        message.reply(
            saudacao() + name.split(" ")[0] + 
            "!\nSou o assistente inteligente da *LinkJr*, ficamos felizes por entrar em contato conosco.\n\n" +
            "Digite o número da opção desejada:\n" +
            "1️⃣ - Solicitar orçamento\n" +
            "2️⃣ - Conhecer nossos produtos (portfólio)\n" +
            "3️⃣ - Falar com um atendente\n" +
            "4️⃣ - Dúvidas frequentes\n" +
            "5️⃣ - Outra opção\n" +
            "6️⃣ - Sair da conversa"
        );
        menuEnviado[message.from] = true;
    } else {
        client.sendMessage(message.from, fimDeSemanaMensagem);
    }
}

module.exports = { processarSaudacao }