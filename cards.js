const path = require('path');

/** 
 * @description draws a card
 * 
 * @returns {string} string of the card drawn
*/
exports.draw = function() {
    let cardId = Math.floor(Math.random() * 54) + 1;  // get the card number

    // if 53 or 54, it's a joker
    if (cardId > 52) {
        let color = "BLACK";
        if (cardId === 53)
            color = "RED";
        return "JOKER_"+color;
    }

    // else, get suit and symbol
    let cardSuit = Math.ceil(cardId / 13);
    let cardNum = cardId % 13 + 1;
    if (cardNum === 0)
        cardSym = 13;

    // get the card string
    let cardStr = "";
    if (cardNum === 1)
        cardStr = "A";
    else if (cardNum === 11)
        cardStr = "J";
    else if (cardNum === 12)
        cardStr = "Q";
    else if (cardNum === 13)
        cardStr = "K";
    else
        cardStr = cardNum.toString();

    cardStr += "_";

    // get card suit
    if (cardSuit === 1)
        cardStr += "SPADES";
    else if (cardSuit === 2)
        cardStr += "HEARTS";
    else if (cardSuit === 3)
        cardStr += "CLUBS";
    else if (cardSuit === 4)
        cardStr += "DIAMONDS";

    return cardStr;
}

/** 
 * @description checks if a card was mentioned and exists in the given array, and returns it's named if yes
 * 
 * @param {string}  str string to be tested for card names
 * @param {string[]}  arr array of strings to be tested for matches
 * 
 * @returns {string[]}    an array containing the names of the cards found, or false, if none was found
 * 
*/
exports.namesCard = function(str, arr) {
    // declare variables
    let symbol = "", suit = "";
    let words = str.replace(/(,|\.)/g, '').toLowerCase().split(" ");
    let enterCard = "";
    // loop over all words, and grab all cards named
    for (let i = 0; i < words.length; i++) {
        // if no symbol found yet
        if (symbol === "") {
            for (symName in symbols) {
                for (symAlias of symbols[symName]) {
                    if (words[i] === symAlias) {
                        symbol = symName;
                        break;
                    }
                }
                if (symbol !== "") {
                    if (symbol === "JOKER")
                        i = 0;
                    break;
                }
            }
        }
        // if symbol found and wasn't joker, check for suit
        else if (symbol !== "JOKER") {
            for (suitName in suits) {
                for (suitAlias of suits[suitName]) {
                    if (words[i] === suitAlias) {
                        suit = suitName;
                        break;
                    }
                }
                if (suit !== "")
                    break;
            }
        }
        // if symbol was a joker, check for color
        else {
            for (colorName in colors) {
                for (colorAlias of colors[colorName])
                    if (words[i] === colorAlias) {
                        suit = colorName;
                        break;
                    }
                if (suit !== "")
                    break;
            }
        }
    }

    // set up enterCard
    enterCard = symbol;
    if (suit !== "")
        enterCard += "_" + suit;

    // if nothing valid entered, return false
    if (enterCard === "")
        return [];
    // if user entered a specific card, search for it
    else if (enterCard.search("_") !== -1) {
        for (card of arr) {
            if (enterCard === card) {
                return [enterCard];
            }
        }
    }

    // if user entered only a card symbol, search for matches
    else {
        let matched = [];
        for (card of arr)
            if (card.split("_")[0] === symbol)
                matched.push(card);
        
        if (matched.length > 0)
            return matched;
    }

    // if no matches found, return false
    return []
}

/**
 * @description returns the portuguese name of the card
 * 
 * @param {string} str  the standardized card name 
 * 
 * @returns {string} the name of the card in portuguese
 */
exports.getCardName = function(str) {
    let retVal = "";

    let symbol = str.split("_")[0];
    let suit   = str.split("_")[1];

    switch (symbol) {
        case 'A':
            retVal += "ás";
            break;
        case '2':
            retVal += "dois";
            break;
        case '3':
            retVal += "três";
            break;
        case '4':
            retVal += "quatro";
            break;
        case '5':
            retVal += "cinco";
            break;
        case '6':
            retVal += "seis";
            break;
        case '7':
            retVal += "sete";
            break;
        case '8':
            retVal += "oito";
            break;
        case '9':
            retVal += "nove";
            break;
        case '10':
            retVal += "dez";
            break;
        case 'J':
            retVal += "valete";
            break;
        case 'Q':
            retVal += "dama";
            break;
        case 'K':
            retVal += "rei";
            break;
    }
    
    switch (suit) {
        case 'CLUBS':
            retVal += " de paus";
            break;
        case 'DIAMONDS':
            retVal += " de ouros";
            break;
        case 'HEARTS':
            retVal += " de copas";
            break;
        case 'SPADES':
            retVal += " de espadas";
            break;
    }

    // take care of joker
    if (str === "JOKER_RED")
        retVal = "coringa vermelho";
    else if (str === "JOKER_BLACK")
        retVal = "conringa preto";

    return retVal;
}

/**
 * @description get the effects of a given card
 * 
 * @param {string} str a card whose effects are to be checked
 * 
 * @returns {string} string describing the cards effects
 */
exports.getCardEffects = function(str) {
    // set up return variable
    let effect = "";
    let suitEffect = "";

    // if joker
    if (str === "JOKER_BLACK" || str === "JOKER_RED") {
        // get new random card
        let card = "";
        while (card === "JOKER_BLACK" || card === "JOKER_RED" || card === "")
            card = exports.draw();

        // if black use first suit effect. if red, use second
        if (str === "JOKER_BLACK")
            suitEffect = suitEffects[card.split("_")[1]][0];
        else if (str === "JOKER_RED")
            suitEffect = suitEffects[card.split("_")[1]][0];

        // tell user what happened
        effect += exports.getCardName(str) + " usado! O coringa ganhou o efeito d";
        if (card.search("Q") !== -1)
            effect += "a";
        else
            effect += "o";
        effect += " " + exports.getCardName(card) + ".\n\n"

        str = card;
    }
    
    // get card data
    let symbol = str.split("_")[0];
    let suit   = str.split("_")[1];

    // if king
    if (symbol === "K") {
        effect += symbEffects[symbol] + "!\n\n" +
            "\t1) " + suitEffects[suit][0] + ".\n" +
            "\t2) " + suitEffects[suit][1] + ".";
    }
    // if joker
    else if (suitEffect !== "") {
        effect += symbEffects[symbol] + ". Além disso, você ganha o efeito abaixo: \n"
            + suitEffect + ".";
    }
    // else
    else {
        effect += symbEffects[symbol] + ". Além disso, você pode escolher ativar um dos seguintes efeitos:\n\n" +
            "\t1) " + suitEffects[suit][0] + ".\n" +
            "\t2) " + suitEffects[suit][1] + ".";
    }

    return effect;
}

exports.arraify = function(obj) {
    let retVal = [];
    for (i in obj) {
        if (obj.hasOwnProperty(i))
            retVal.push(i);
    }

    return retVal;
}

const symbols = {
    A: [
        "a",
        "as",
        "ás",
        "às",
        "az",
        "ace",
    ],
    2: [
        "2",
        "dois",
        "doiz",
        "two"
    ],
    3: [
        "3",
        "tres",
        "três",
        "trez",
        "trêz",
        "tree",
        "three",
        "trhee",
        "tre",
        "thre",
        "trhe"
    ],
    4: [
        "4",
        "quatro",
        "four"
    ],
    5: [
        "5",
        "cinco",
        "five"
    ],
    6: [
        "6",
        "seis",
        "six"
    ],
    7: [
        "7",
        "sete",
        "seven"
    ],
    8: [
        "8",
        "oito",
        "eight",
        "eigth",
        "eihgt",
        "eihtg",
        "eithg",
        "eitgh"
    ],
    9: [
        "9",
        "nove",
        "nine",
        "nein"
    ],
    10: [
        "10",
        "dez",
        "ten"
    ],
    J: [
        "j",
        "valete",
        "jack"
    ],
    Q: [
        "q",
        "dama",
        "rainha",
        "queen"
    ],
    K: [
        "k",
        "rei",
        "king"
    ],
    JOKER: [
        "joker",
        "curinga",
        "coringa"
    ]
};
const suits = {
    CLUBS: [
        "club",
        "clubs",
        "pau",
        "paus"
    ],
    DIAMONDS: [
        "diamonds",
        "ouro",
        "ouros"
    ],
    HEARTS: [
        "hearts",
        "copas",
        "coracao",
        "coracão",
        "coraçao",
        "coração",
    ],
    SPADES: [
        "espada",
        "espadas",
        "spades"
    ]
};
const colors = {
    BLACK: [
        "preto",
        "black"
    ],
    RED: [
        "vermelho",
        "red"
    ]
};
const suitEffects = {
    CLUBS: [
        "+1 vantagem no seu próximo ataque nesse turno. Esse ataque ignora Guard e Dodge",
        "-2 desvantagem no próximo ataque que você receber entre agora e o início do seu próximo turno"
    ],
    DIAMONDS: [
        "Até o final do seu próximo turno, você pode trocar a sua Ação Menor e seu movimento por uma Ação Maior, ou ganhar uma Ação Menor adicional",
        "Escolha um inimigo. No próximo turno dele, ele não terá a sua Ação Maior"
    ],
    HEARTS: [
        "Escolha um tipo de dano. Você tem resistência a ele até o final do seu próximo turno. Se já for resistente ao tipo de dano, você ganha imunidade a ele",
        "Escolha um inimigo e um tipo de dano. Esse inimigo perde resistência a esse tipo de dano até o final do seu próximo turno. Se o inimigo não tiver resistência ao tipo de dano escolhido, ele tem fraqueza contra esse dano até o final do seu próximo turno"
    ],
    SPADES: [
        "O próximo ataque que você fizer ou Skill de dano ou cura que você usar nesse turno recebe +2 no Attributo relevante no Dano/Cura",
        "O próximo ataque inimigo que você receber até o seu próximo turno causa dano mínimo"
    ]
};
const symbEffects = {
    A: "Seu próximo ataque ou Skill de dano/cura nesse turno causa dano máximo, mas não explode",
    2: "Você recupera toda a sua Stamina",
    3: "Você pode se mover o dobro da sua velocidade padrão nesse turno",
    4: "Você ganha Guard equivalente a seu Level +2 até o fim do seu próximo turno",
    5: "A próxima Skill que você usar não custa Mana nem Stamina",
    6: "A sua próxima rolagem tem sucesso automático (a não ser que o mestre diga que não)",
    7: "Você ganha Dodge equivalente a seu Level até o fim do seu próximo turno",
    8: "Você recupera metade da sua Mana máxima",
    9: "Você recupera um quarto da sua Vida Máxima",
   10: "O próximo ataque contra você tem -1 desvantagem",
    J: "Você ganha 1 Legend Point",
    Q: "Role um 1d4. Se deu 4, compre outra carta!",
    K: "Você pode ativar os dois efeitos abaixo em vez de um só"
};