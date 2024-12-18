const { despedida } = require('./funcao_despedida.js');

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

module.exports = { tratarOpcoes }