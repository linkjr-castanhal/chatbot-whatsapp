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

module.exports = { saudacao }