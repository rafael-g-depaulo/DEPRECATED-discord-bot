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
 * @description checks if a card was mentioned, and returns it's named if yes
 * 
 * @param {string} str string to be tested for card names
 * 
 * @returns {string|boolean}    the name of the card, or false, if none was mentioned
 * 
*/
exports.namesCard = function() {

    // c
}