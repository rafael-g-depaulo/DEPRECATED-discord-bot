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
 * @description checks if a card was mentioned and exists, and returns it's named if yes
 * 
 * @param {string} str string to be tested for card names
 * @param {Character} char string to be tested for card names
 * 
 * @returns {string[]|boolean}    an array containing the names of the cards found, or false, if none was found
 * 
*/
exports.namesCard = function(str, char) {

    // declare variables
    let symbol = "", suit = "";
    let words = str.replace(/(,|\.)/g, '').toLowerCase().split(" ");
    let enterCard = "";

    // loop over all words, and grab all cards named
    for (let i = 0; i < words.length; i++) {
        // if no symbol found yet
        if (symbol === "") {
            for (symName in symbols) {
                for (symAlias of symbols[symName])
                    if (words[i] === symAlias) {
                        symbol = symName;
                        break;
                    }
                if (symbol !== "")
                    break;
            }
        }
        // if symbol found and wasn't joker, check for suit
        else if (symbol !== "JOKER") {
            for (suitName in suits) {
                for (suitAlias of suits[suitName])
                    if (words[i] === suitAlias) {
                        suit = suitName;
                        break;
                    }
                if (suit !== "") {
                    enterCard = symbol+"_"+suit;
                    break;
                }
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
                if (suit !== "") {
                    enterCard = symbol+"_"+suit;
                    break;
                }
            }
        }
        if (i === words.length - 1 && symbol !== "" && suit === "")
            enterCard = symbol;
    }

    // if no card mentioned, return false
    if (enterCard === "")
        return false;

    // if user entered a specific card, search for it
    else if (enterCard.search("_") !== -1) {
        for (card in char.cards)
            if (char.cards.hasOwnProperty(card) && enterCard === card)
                return [enterCard];
    }

    // if user entered only a card symbol, search for matches
    else {
        let matched = [];

        for (card in char.cards) {
            if (char.cards.hasOwnProperty(card) && card.split("_")[0] === enterCard)
                matched.push(card);
        }

        if (matched.length > 0)
            return matched;
    }

    // if no matches found, return false
    return false
}

/**
 * @description returns the portuguese name of the card
 * 
 * @param {string} str  the standardized card name 
 * 
 * @returns {string} the name of the card in portuguese
 */
exports.getCardName = function(str) {
    let symbol = str.split("_")[0];
    let suit   = str.split("_")[1];

    let retVal = "";

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
}
const colors = {
    BLACK: [
        "preto",
        "black"
    ],
    RED: [
        "vermelho",
        "red"
    ]
}