const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

const menuEnviado = {};
const aguardandoSugestao = {};

client.on('ready', () => {
    console.log('Conectado com sucesso!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

const greetings = ["oi", "olá", "hello", "hi", "bom dia", "boa tarde", "boa noite", "salve", "aoba"];

function saudacao() {
    const data = new Date();
    let hora = data.getHours();
    let str = '';
    if (hora >= 8 && hora < 15) {
        str = 'Bom dia ';
    } else if (hora >= 15 && hora < 21) {
        str = 'Boa tarde ';
    } else {
        str = 'Boa noite ';
    }
    return str;
};

function fimDeSemana() {
    const data = new Date();
    let dia = data.getDay();
    let strtres = '';
    if (dia === 0) { // Domingo
        strtres = '🏖️ *Aproveite o domingo!*\n\n😃 Entraremos em contato assim que possível.\n\n🕘 Nosso horário é de segunda a sexta de 09:00hs às 19:00hs\n\n*Atendimento presencial mediante agendamento.*';
    } else if (dia === 6) { // Sábado
        strtres = '🏖️ *Aproveite o sábado!*\n\n😃 Entraremos em contato assim que possível.\n\n🕘 Nosso horário é de segunda a sexta de 09:00hs às 19:00hs\n\n*Atendimento presencial mediante agendamento.*';
    }
    return strtres;
};

async function processarSaudacao(message) {
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

function despedida() {
    return (
        "👋 *Encerrando a conversa...*\n\n" +
        "Agradecemos por utilizar nossos serviços. Foi um prazer poder ajudá-lo(a) com suas dúvidas e necessidades. Caso precise de mais assistência no futuro, estaremos sempre à disposição para atendê-lo(a).\n\n" +
        "Desejamos um excelente dia e sucesso em suas atividades. Até a próxima!"
    );
}

function tratarOpcoes(opcao) {
    switch (opcao) {
        case '1':
            return "📝 *Solicitar orçamento*\nPor favor, informe os detalhes do que você precisa. Entraremos em contato com uma proposta personalizada.";
        case '2':
            return "📂 *Conhecer nossos produtos*\nConfira nosso portfólio em: https://github.com/linkjrcastanhal.";
        case '3':
            return "📞 *Falar com um atendente*\nPor favor, aguarde enquanto conectamos você com um de nossos atendentes.";
        case '4':
            return "❓ *Dúvidas Frequentes*\nAcesse nossa página de dúvidas frequentes em: https://linkjr.com.br/.";
        case '5':
            return "💬 *Outra opção*\nDescreva como podemos ajudar e retornaremos o mais rápido possível.";
        case '6':
            return despedida();
        default:
            return "❌ *Opção inválida.* Por favor, escolha uma das opções disponíveis.";
    }
}

client.on('message', async (message) => {
    const messageText = message.body.toLowerCase();

    // Se o usuário estiver no estado de aguardando sugestão
    if (aguardandoSugestao[message.from]) {
        message.reply("💾 *Sugestão salva!*\nObrigado por compartilhar sua sugestão. Vamos analisá-la com atenção.");
        delete aguardandoSugestao[message.from]; // Reseta o estado de sugestão
        return;
    }

    // Saudações iniciais
    if (greetings.some((greeting) => messageText.includes(greeting))) {
        await processarSaudacao(message);
    } else if (!isNaN(messageText) && menuEnviado[message.from]) {
        // Verifica se é uma opção válida e o menu foi enviado
        const resposta = tratarOpcoes(messageText.trim());
        if (resposta) {
            message.reply(resposta);
            if (messageText === '5') {
                // Marca que o usuário entrou no estado de sugestão
                aguardandoSugestao[message.from] = true;
            } else if (messageText === '6') {
                // Remove o contato do controle de estado após a despedida
                delete menuEnviado[message.from];
            }
        } else {
            message.reply("❌ *Opção inválida.* Por favor, escolha uma das opções disponíveis.");
        }
    } else if (menuEnviado[message.from]) {
        // Mensagem para entrada inválida apenas se o menu já foi enviado
        message.reply("❓ Não entendi sua mensagem. Por favor, digite o número correspondente à opção desejada.");
    }
});


client.initialize();
