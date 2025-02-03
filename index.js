const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { processarSaudacao } = require('./src/funcao_processar_saudacao');
const { tratarOpcoes } = require('./src/funcao_tratar_opcoes.js');

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Configurações necessárias para o Heroku
    }
});

const menuEnviado = {};
const aguardandoSugestao = {};
const tempoConversa = {}; // Armazena o tempo de início da conversa
const LIMITE_TEMPO_CONVERSA = 30 * 60 * 1000; // 30 minutos em milissegundos

let qrCodeUrl = ''; // Variável para armazenar a URL do QR Code

client.on('ready', () => {
    console.log('Conectado com sucesso!');
});

client.on('qr', qr => {
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Erro ao gerar QR Code:', err);
        } else {
            qrCodeUrl = url; // Armazena a URL do QR Code
            console.log('QR Code gerado:', url);
        }
    });
});

const greetings = ["oi", "olá", "hello", "hi", "bom dia", "boa tarde", "boa noite", "salve", "aoba"];

// Função para verificar se está fora do expediente
function foraDoExpediente() {
    const data = new Date();
    const hora = data.getHours();
    const dia = data.getDay();

    // Considerando horário de expediente de segunda a sexta, das 09:00 às 19:00
    const horarioInicio = 9;
    const horarioFim = 19;

    // Fora do expediente se for sábado (6) ou domingo (0) ou fora do horário
    return dia === 0 || dia === 6 || hora < horarioInicio || hora >= horarioFim;
}

// Mensagem padrão para fora do expediente
const mensagemForaExpediente = 
    "🔔 *Olá! Obrigado por entrar em contato!*\n\n" +
    "No momento, estamos fora do horário de atendimento. Não se preocupe, sua mensagem é muito importante para nós e será respondida assim que retornarmos!\n\n" +
    "🕘 Nosso horário de atendimento: Segunda a Sexta, das 09:00 às 19:00.\n" +
    "✨ Enquanto isso, sinta-se à vontade para explorar nossos serviços e produtos em nosso site: https://linkjr.com.br/.\n\n" +
    "Agradecemos sua paciência e compreensão. Até breve!";

client.on('message', async (message) => {
    const messageText = message.body.toLowerCase();

    // Verifica se está fora do expediente
    if (foraDoExpediente()) {
        message.reply(mensagemForaExpediente);
        return; // Encerrar processamento adicional para mensagens fora do horário
    }

    // Verifica o tempo de conversa
    const inicioConversa = tempoConversa[message.from];
    if (inicioConversa && Date.now() - inicioConversa > LIMITE_TEMPO_CONVERSA) {
        message.reply(
            "⏳ *Tempo de conversa encerrado!*\n\n" +
            "Para melhor atender, encerramos automaticamente conversas que excedem nosso limite de tempo. Caso precise de mais assistência, sinta-se à vontade para nos enviar uma nova mensagem!"
        );
        delete menuEnviado[message.from];
        delete aguardandoSugestao[message.from];
        delete tempoConversa[message.from];
        return;
    }

    // Se o usuário estiver no estado de aguardando sugestão
    if (aguardandoSugestao[message.from]) {
        message.reply("💾 *Sugestão salva!*\nObrigado por compartilhar sua sugestão. Vamos analisá-la com atenção.");
        delete aguardandoSugestao[message.from]; // Reseta o estado de sugestão
        return;
    }

    // Saudações iniciais
    if (greetings.some((greeting) => messageText.includes(greeting))) {
        await processarSaudacao(message, menuEnviado);
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
                delete tempoConversa[message.from];
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

// Rota para exibir o QR Code
app.get('/', (req, res) => {
    if (qrCodeUrl) {
        res.send(`<img src="${qrCodeUrl}" alt="QR Code" />`);
    } else {
        res.send('Aguardando QR Code...');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
