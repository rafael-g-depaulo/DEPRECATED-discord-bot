/**
 * @author Rafael 'Ragan' Gonçalves
 * @fileOverview Manages formulas and things related to Open Legend - Fantasy Battle.
 */

// loading modules
const Dice = require('./dice.js');
const cards = require('./cards.js');
const path = require('path');

/**
 * @description Rolls an Attribute
 * 
 * @param {Attribute} attribute 
 * 
 * @returns returns the dice roll for the attribute
 */
exports.rollAttribute = function (attribute, adv) {
    adv = adv || 0;
    let list = false;
    if (adv !== 0)
        list = true;

    return Dice.rollDice(
        [{
            diceQnt: 1,
            diceMax: 20,
            diceAdv: adv,
            diceBonus: 2 * attribute,
            explode: false
        }],
        list, true, false);
}

exports.rollAttack = function (attribute, adv) {
    adv = adv || 0;
    let list = false;
    if (adv !== 0)
        list = true;

    return Dice.rollDice(
        [{
            diceQnt: 1,
            diceMax: 20,
            diceAdv: adv,
            diceBonus: attribute,
            explode: false
        }],
        list, true, false);
}

exports.rollInitiative = function (agility, adv) {
    adv = adv || 0;
    let list = false;
    if (adv !== 0)
        list = true;

    return Dice.rollDice(
        [{
            diceQnt: 1,
            diceMax: 20,
            diceAdv: adv,
            diceBonus: agility,
            explode: false
        }],
        list, true, false);
}

exports.rollDamage = function (attribute, adv, superExp) {
    adv = adv || 0;
    superExp = superExp || false;
    let list = false;
    if (adv !== 0)
        list = true;

    // set up dice to roll
    let dice = {};
    dice.diceAdv = adv;
    dice.diceBonus = 0;
    dice.explode = true;
    dice.superExplode = superExp;

    switch (attribute) {
        case 0:
            dice.diceQnt = 1;
            dice.diceMax = 2;
            break;
        case 1:
            dice.diceQnt = 1;
            dice.diceMax = 4;
            break;
        case 2:
            dice.diceQnt = 1;
            dice.diceMax = 6;
            break;
        case 3:
            dice.diceQnt = 1;
            dice.diceMax = 8;
            break;
        case 4:
            dice.diceQnt = 1;
            dice.diceMax = 10;
            break;
        case 5:
            dice.diceQnt = 2;
            dice.diceMax = 6;
            break;
        case 6:
            dice.diceQnt = 2;
            dice.diceMax = 8;
            break;
        case 7:
            dice.diceQnt = 2;
            dice.diceMax = 10;
            break;
        case 8:
            dice.diceQnt = 3;
            dice.diceMax = 8;
            break;
        case 9:
            dice.diceQnt = 3;
            dice.diceMax = 10;
            break;
        case 10:
            dice.diceQnt = 4;
            dice.diceMax = 10;
            break;
        case 11:
            dice.diceQnt = 8;
            dice.diceMax = 4;
            break;
        case 12:
            dice.diceQnt = 5;
            dice.diceMax = 8;
            break;
        case 13:
            dice.diceQnt = 10;
            dice.diceMax = 4;
            break;
        case 14:
            dice.diceQnt = 8;
            dice.diceMax = 6;
            break;
        case 15:
            dice.diceQnt = 3;
            dice.diceMax = 20;
            break;
        case 16:
            dice.diceQnt = 10;
            dice.diceMax = 6;
            break;
        case 17:
            dice.diceQnt = 6;
            dice.diceMax = 12;
            break;
        case 18:
            dice.diceQnt = 8;
            dice.diceMax = 10;
            break;
        case 19:
            dice.diceQnt = 11;
            dice.diceMax = 8;
            break;
        case 20:
            dice.diceQnt = 10;
            dice.diceMax = 10;
            break;
        default:
            dice.diceQnt = 1;
            dice.diceMax = 2;
            break;
    }

    return Dice.rollDice([dice], list, true, false);
}

/**
 * @description checks if att is a valid attribute name, then calls func(att) if so.
 * 
 * @param {string} att          attribute to be used in function call
 * @param {Function} ifValid    function to be executed on valid attributes. uses att as argument
 * @param {Function} ifInvalid  function to be executed on invalid attributes. uses att as argument
 * 
 * @returns {Boolean} returns true if att is a valid attribute, false if not
 */
exports.useAttribute = function (att, ifValid, ifInvalid) {
    ifValid = ifValid || (() => {});
    ifInvalid = ifInvalid || (() => {});
    att = att.toLowerCase().trim();

    // iterate over all attributes
    for (attb in Stats) {
        // iterate over all possible names for an attribute
        for (statName of (Stats[attb])) {
            if (att === statName) {
                ifValid(attb);
                return true;
            }
        }
    }
    ifInvalid(att);
    return false;
}

exports.getMaxHP = function(char) {
    return (
        10 +
        2 * char.Fortitude +
        2 * char.Presence + 
        1 * char.Will + 
        Math.floor(1.5 * char.Might) + 
        2 * char.Level
    );
}

exports.getMaxMP = function(char) {
    let maxSuper = [
        char.Alteration,
        char.Creation,
        char.Energy,
        char.Entropy,
        char.Influence,
        char.Movement,
        char.Prescience,
        char.Protection
    ].sort((a, b) => a-b)[0];

    return (
        10 +
        3 * char.Learning +
        2 * char.Will +
        Math.ceil(1.5 * maxSuper) +
        2 * char.Level
    );
}

exports.getMaxStamina = function(char) {
    return (
        10 +
        3 * char.Fortitude +
        2 * char.Agility +
        1 * char.Might +
        1 * char.Level
    );
}

exports.useResource = function(res, ifValid) {
    ifValid = ifValid || (() => {});
    res = res.toLowerCase().trim();

    // iterate over all attributes
    for (resource in Resources) {
        // iterate over all possible names for an attribute
        for (resName of (Resources[resource])) {
            if (res === resName) {
                ifValid(resName);
                return true;
            }
        }
    }
    return false;
}

/**
 * @description tests if a string is a valid command for OL: FB. if yes, take care of it. if no, returns false.
 * 
 * @param {string} cmd          command string 
 * @param {Character} char      character 
 * 
 * @returns {{msg: string, char: Character, attach: {}}|boolean}    Either a string of the resolved command, or false if no valid command
 */
exports.command = function(cmd, char) {
// setting up the return message, and first word of command
    let msg = "";
    let command = cmd.trim().split(" ")[0].toLowerCase();
    let arg1;
    if (cmd.trim().split(" ").length > 1)
        arg1 = cmd.trim().split(" ")[1].toLowerCase();
    let attach = {};

// testing for commands
    // if rolling "!attribute [advantage] [bonus]"
    if (exports.useAttribute(command,
        (Attribute) => {
            let advBonus = getAdvBonus(cmd);
            msg += "**" + char.name + "**, rolando **" + Attribute + "**:\n";
            msg += exports.rollAttribute(char[Attribute] + advBonus.bonus, advBonus.adv);
        }
    ));
    // if rolling "!initiative [advantage] [bonus]"
    else if (command === "initiative" || command === "iniciative" ||
             command === "iniciativa") {
        let advBonus = getAdvBonus(cmd);
        msg += "Iniciativa para **" + char.name + "**:\n";
        msg += exports.rollInitiative(char.Agility + advBonus.bonus, advBonus.adv);
    }
    // if rolling "!damage [attribute] [advantage] [bonus]"
    else if (command === "dmg"  || command === "damg" || command === "damag" ||
             command === "dano" || command === "damage") {
        let attb = "";
        if (cmd.trim().split(" ").length > 1)
            attb = cmd.trim().split(" ")[1].toLowerCase();
        exports.useAttribute(attb,
        // if there is an attribute, use it
            (Attribute) => {
                let advBonus = getAdvBonus(cmd);
                msg += "**" + char.name + "**, rolando dano para **" + Attribute + "**:\n";
                msg += exports.rollDamage(char[Attribute] + advBonus.bonus, advBonus.adv);
            },
        // if there isn't an attribute, use the character's attack attribute
            () => {
                let advBonus = getAdvBonus(cmd);
                msg += "**" + char.name + "**, rolando dano para **" + char.attackAttribute + "**:\n";
                msg += exports.rollDamage(char[char.attackAttribute] + advBonus.bonus, advBonus.adv);
            }
        );
    }
    // if taking/restoring/checking HP, Mana or Stamina
    else if (exports.useResource(command,
        (resource) => {
            // if there is damage/healing to add
            while (/(\+|-) *[0-9]+/.test(cmd)) {
                // if positive
                if (/\+ *[0-9]+/.test(cmd))
                    char[resource] += Number(/[0-9]+/.exec(cmd)[0]);
                // if negative
                if (/- *[0-9]+/.test(cmd))
                    char[resource] -= Number(/[0-9]+/.exec(cmd)[0]);

                cmd = cmd.slice(/(\+|-) *[0-9]+/.exec(cmd).index + /(\+|-) *[0-9]+/.exec(cmd)[0].length);
            }

            // if above max, restore to max
            if (char[resource] > char[resource+"_max"])
                char[resource] = char[resource+"_max"];

            msg += "**" + resource.toUpperCase() + "**: " + char[resource] + "/" + char[resource+"_max"];

            msg += "\n";
        }
    ));
    // if drawing a card
    else if (command === "draw" || command === "drawcard") {
        let card = cards.draw();
        // if doesn't have a cards property, give it one
        if (!char.hasOwnProperty("cards"))
            char.cards = {};

        // if the character has cards of that type, add 1 to the property
        if (char.cards.hasOwnProperty(card))
            char.cards[card]++;
        else
            char.cards[card] = 1;

        let symbol = card.split("_")[0];

        msg += "Você comprou uma carta. A sua carta é ";

        if (symbol === 'Q')
            msg += "a ";
        else
            msg += "o ";

        msg += cards.getCardName(card) + ".";

        attach = {
            files:[{
                attachment: path.join(__dirname, "/media/cards/"+card+".png"),
                name: card+'.png'
            }]
        };
    }
    // if using a card
    else if (command === "card" || command === "carta" || command === "usecard" || command === "usacarta"
    || ( (command === "use" || command === "usa") && (arg1 === "card" || arg1 === "carta"))) {

        // se o personagem não tem um card, retorne
        if (!char.hasOwnProperty("cards") || Object.keys(char.cards).length === 0) {
            msg = "Você não tem nenhum card. Seto Kaiba ficaria decepcionado.";
        } else {
            let matchCards;
            // se tem um card só, use ele
            if (Object.keys(char.cards).length === 1) {
                // get card
                let card = Object.keys(char.cards)[0];

                // confirm effects
                msg += "Você quer mesmo gastar ";
                if (card.search("Q") !== -1)
                    msg += "a ";
                else
                    msg += "o ";
                msg += cards.getCardName(card) + "?";

                char.conversation = "spendCardConfirm";
                char.cardSpending = card;
            }
            // se falou um card pelo nome
            else if ((matchCards = cards.namesCard(cmd, cards.arraify(char.cards))).length >= 1) {
                // if just one match
                if (matchCards.length === 1) {
                    // send user message
                    msg += "Você quer mesmo gastar ";
                    if (matchCards[0].search("Q") !== -1)
                        msg += "a ";
                    else
                        msg += "o ";
                    msg += cards.getCardName(matchCards[0]) + "?";
                        
                    char.conversation = "spendCardConfirm";
                    char.cardSpending = matchCards[0];
                }
                // if multiple matches
                else {
                    msg += "Vários cards compatíveis achados. Qual das seguintes cartas você quer usar?\n";
                    for (let i = 0; i < matchCards.length; i++) {
                        msg += "\n\t" + (i+1) + ") " + cards.getCardName(matchCards[i]);
                        if (char.cards[matchCards[i]] > 1)
                            msg += " (x" + char.cards[matchCards[i]] + ")";
                    }

                    char.conversation = "choseSpendCard";
                    char.cardChosing = matchCards;
                }
            }
            // se não entrou nenhum card de argumento, e o usuário tem vários cards
            else {
                msg += "Você tem multiplas cartas. Qual delas você quer usar?\n";
                let charCards = [];
                for (let i = 0; i < Object.keys(char.cards).length; i++) {
                    if (char.cards.hasOwnProperty(Object.keys(char.cards)[i])) {
                        charCards.push(Object.keys(char.cards)[i]);
                        msg += "\n\t" + (i+1) + ") " + cards.getCardName(Object.keys(char.cards)[i]);
                        if (char.cards[Object.keys(char.cards)[i]] > 1)
                            msg += " (x" + char.cards[Object.keys(char.cards)[i]] + ")";
                    }
                }

                char.conversation = "choseSpendCard";
                char.cardChosing = charCards;
            }
        }
    }
// if it wasn't a valid command, check if in a conversation with the bot regarding the character
    // else, return false
    else {
        return false;
    }

    return {
        msg: msg,
        char: char,
        attach: attach
    };
}

exports.conversation = function(cmd, char) {
    let msg = "";
    let attach = {};

    // chosing card to spend
    if (char.conversation === "choseSpendCard") {
        let card = cards.namesCard(cmd, char.cardChosing);
        // if valid card was mentioned
        if (card.length >= 1) {
            card = card[0];
            char.cardSpending = card;
            char.conversation = "spendCardConfirm";

            msg += "Tem certeza que quer usar ";
            if (card.search("Q") !== -1)
                msg += "a ";
            else
                msg += "o ";
            msg += cards.getCardName(card) + "?";
        }
        // if called it by number
        else if (!Number.isNaN(cmd.trim()) && Number(cmd.trim()) > 0 && Number(cmd.trim()) <= char.cardChosing.length) {
            card = char.cardChosing[Number(cmd.trim())-1];
            char.cardSpending = card;
            char.conversation = "spendCardConfirm";

            msg += "Tem certeza que quer usar ";
            if (card.search("Q") !== -1)
                msg += "a ";
            else
                msg += "o ";
            msg += cards.getCardName(card) + "?";
        }
        // if no valid card was mentioned
        else {
            msg += "Opção inválida! Idiota.";
            delete char.conversation;
            delete char.cardChosing;
        }
    }
    // confirming card to spend
    else if (char.conversation === "spendCardConfirm") {
        let command = cmd.trim().split(" ")[0].toLowerCase().trim();
        if (command === "yes" || command === "y" || command === "sim" || command === "s") {
            msg += cards.getCardName(char.cardSpending) + " usad";
            if (char.cardSpending.search("Q") !== -1)
                msg += "a. ";
            else
                msg += "o. ";
            if (char.cardSpending.search("JOKER") !== -1)
                msg += char.name + " ganha o seguinte efeito:\n\n";
            else
                msg += char.name + " ganha os seguintes efeitos:\n\n";
            
            msg += cards.getCardEffects(char.cardSpending);

            char.cards[char.cardSpending]--;
            if (char.cards[char.cardSpending] === 0)
                delete char.cards[char.cardSpending];
            if (Object.keys(char.cards).length === 0)
                delete char.cards;
            delete char.conversation;
            delete char.cardSpending;
        }
        else if (command === "nao" || command === "não" || command === "no" || command === "n") {
            msg += "Ok! então a carta não será usada.";
            delete char.conversation;
            delete char.cardSpending;
        }
        else {
            msg += "Eu não entendi. aprende a escrever, oh idiota.";
        }
    }

    // if (msg === "")
    //     delete char.conversation;

    return {
        msg: msg,
        char: char,
        attach: attach
    };
}

const getAdvBonus = function(cmd) {
    // try to get advantage (oh god why am i doing this)
    let advantageWords = Dice.getAdvWords().adv,
        disadvantageWords = Dice.getAdvWords().dis;
    let advRegStr = "(\\++|-+)? *[0-9]* *(";
    for (i in advantageWords) {
        if (i != 0)
            advRegStr += "|";
        advRegStr += advantageWords[i];
    }
    advRegStr += ")";
    let advRegExp = new RegExp(advRegStr, "i");
    let disRegStr = "(\\++|-+)? *[0-9]* *(";
    for (i in disadvantageWords) {
        if (i != 0)
            disRegStr += "|";
            disRegStr += disadvantageWords[i];
    }
    disRegStr += ")";
    let disRegExp = new RegExp(disRegStr, "i");

    let adv = 0;
    // if there is positive advantage
    if (advRegExp.test(cmd)) {
        let advStr = advRegExp.exec(cmd)[0];
        if (/- *[0-9]+/.test(advStr))
            adv -= Number(/[0-9]+/.exec(cmd)[0]);
        else if (/\+ *[0-9]+/.test(advStr))
            adv += Number(/[0-9]+/.exec(cmd)[0]);
        else
            adv = 1;
        
        cmd = cmd.slice(advRegExp.exec(cmd).index + advRegExp.exec(cmd)[0].length);
    }
    // if there is negative advantage
    else if (disRegExp.test(cmd)) {
        let advStr = disRegExp.exec(cmd)[0];
        if (/[0-9]+/.test(advStr))
            adv -= Number(/[0-9]+/.exec(cmd)[0]);
        else
            adv = -1;
        
        cmd = cmd.slice(disRegExp.exec(cmd).index + disRegExp.exec(cmd)[0].length);
    }
    // get bonus
    let bonus = 0;
    while (/(\+|-) *[0-9]+/.test(cmd)) {
        // if the bonus is positive
        if (/\+ *[0-9]+/.test(cmd))
            bonus += Number(/[0-9]+/.exec(cmd)[0]);
        // if the bonus is negative
        if (/\- *[0-9]+/.test(cmd))
            bonus -= Number(/[0-9]+/.exec(cmd)[0]);

        cmd = cmd.slice(/(\+|-) *[0-9]+/.exec(cmd).index + /(\+|-) *[0-9]+/.exec(cmd)[0].length);
    }

    return {
        adv: adv,
        bonus: bonus
    };
}

// exports.getAdvBonus = getAdvBonus;   // dunno why this is here. if ever needed, de-comment it

// setting up constants /////////////////////////////////////////////////////////////////////////////////////////////////////////
const Stats = {
    Agility: [
        "agi",
        "agil",
        "agilit",
        "agility",
        "agilidade"
    ],
    Fortitude: [
        "for",
        "fort",
        "fortitude"
    ],
    Might: [
        "mig",
        "migh",
        "mgt",
        "might",
        "mihgt",
        "migth", 
        "str",
        "strength",
        "strenthg",
        "strenhtg",
        "forca",
        "força"
    ],
    Learning: [
        "lea",
        "lear",
        "learn",
        "learning",
        "apre",
        "apren",
        "aprend",
        "aprendiz",
        "aprendizado"
    ],
    Logic: [
        "log",
        "logi",
        "logic",
        "lóg",
        "lógi",
        "lógic",
        "lógica"
    ],
    Perception: [
        "perc",
        "perce",
        "percep",
        "perception",
        "percepcao",
        "percepçao",
        "percepção"
    ],
    Will: [
        "wil",
        "will",
        "wil",
        "wil",
        "vontade",
        "vont"
    ],
    Deception: [
        "dec",
        "decep",
        "deception",
        "decepção",
        "decepcão",
        "decepçao",
        "decepcao"
    ],
    Persuasion: [
        "pers",
        "persuasion",
        "persuation",
        "persuasao",
        "persuazao",
        "persuasão",
        "persuazão"
    ],
    Presence: [
        "prese",
        "presence",
        "presenca",
        "presença"
    ],
    Alteration: [
        "al",
        "alt",
        "alte",
        "alter",
        "alteration",
        "alterasion",
        "alteracao",
        "alteracão",
        "alteraçao",
        "alteração"
    ],
    Creation: [
        "cre",
        "crea",
        "creat",
        "creation",
        "cri",
        "cria",
        "criacao",
        "criacão",
        "criaçao",
        "criação"
    ],
    Energy: [
        "ene",
        "ener",
        "energy",
        "energia"
    ],
    Entropy: [
        "ent",
        "entr",
        "entropy",
        "entropia"
    ],
    Influence: [
        "inf",
        "infl",
        "influ",
        "influence",
        "influencia",
        "influência"    
    ],
    Movement: [
        "mov",
        "move",
        "movement",
        "movi",
        "movim",
        "movimento"
    ],
    Prescience: [
        "presc",
        "presci",
        "prescien",
        "presciên",
        "prescience",
        "presciencia",
        "presciência"
    ],
    Protection: [
        "pro",
        "prot",
        "protec",
        "protect",
        "protection",
        "proteç",
        "proteção"
    ]
};

const Resources = {
    HP: [
        "hp",
        "health",
        "healthpoints",
        "hitpoints",
        "vida",
        "saude",
        "saúde"
    ],
    MP: [
        "mp",
        "mana",
        "manapoint",
        "manapoints",
        "magicpoints",
        "magic",
    ],
    Stamina: [
        "stamina",
        "estamina"
    ]
};
// setting up constants /////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef Resource
 * 
 * @property {number} Base       base/bonus of the resource
 * @property {number} Level      how much resource the character gains based on their level
 * 
 * @property {number} HighPhys   multiplier of character's Highest Physical Attribute on resource's formula
 * @property {number} HighMental multiplier of character's Highest Mental Attribute on resource's formula
 * @property {number} HighSocial multiplier of character's Highest Social Attribute on resource's formula
 * @property {number} HighSuper  multiplier of character's Highest Supernatural Attribute on resource's formula
 * 
 * @property {number} Agility    multiplier of character's Agility on resource's formula
 * @property {number} Fortitude  multiplier of character's fortitude on resource's formula
 * @property {number} Might      multiplier of character's Might on resource's formula
 * 
 * @property {number} Learning   multiplier of character's Learning on resource's formula
 * @property {number} Logic      multiplier of character's Logic on resource's formula
 * @property {number} Perception multiplier of character's Perception on resource's formula
 * @property {number} Will       multiplier of character's Will on resource's formula
 * 
 * @property {number} Deception  multiplier of character's Deception on resource's formula
 * @property {number} Persuasion multiplier of character's Persuasion on resource's formula
 * @property {number} Presence   multiplier of character's Presence on resource's formula
 * 
 * @property {number} Alteration multiplier of character's Alteration on resource's formula
 * @property {number} Creation   multiplier of character's Creation on resource's formula
 * @property {number} Energy     multiplier of character's Energy on resource's formula
 * @property {number} Entropy    multiplier of character's Entropy on resource's formula
 * @property {number} Influence  multiplier of character's Influence on resource's formula
 * @property {number} Movement   multiplier of character's Movement on resource's formula
 * @property {number} Prescience multiplier of character's Prescience on resource's formula
 * @property {number} Protection multiplier of character's Protection on resource's formula
 */

/**
 * @typedef Character
 * 
 * @property {string} name
 * @property {string} system
 * @property {string} attackAttribute
 * 
 * @property {number} Level
 * 
 * @property {number} Agility    
 * @property {number} Fortitude  
 * @property {number} Might      
 * 
 * @property {number} Learning   
 * @property {number} Logic      
 * @property {number} Perception 
 * @property {number} Will       
 * 
 * @property {number} Deception  
 * @property {number} Persuasion 
 * @property {number} Presence   
 * 
 * @property {number} Alteration 
 * @property {number} Creation   
 * @property {number} Energy     
 * @property {number} Entropy    
 * @property {number} Influence  
 * @property {number} Movement   
 * @property {number} Prescience 
 * @property {number} Protection
 */