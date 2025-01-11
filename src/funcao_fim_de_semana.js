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

module.exports = { fimDeSemana }