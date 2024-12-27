const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { processarSaudacao } = require('./src/funcao_processar_saudacao');
const { tratarOpcoes } = require('./src/funcao_tratar_opcoes.js');

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
        await processarSaudacao(message,menuEnviado);
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
