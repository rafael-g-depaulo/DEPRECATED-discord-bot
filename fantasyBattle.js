/**
 * @author Rafael 'Ragan' Gonçalves
 * @fileOverview Manages formulas and things related to Open Legend - Fantasy Battle.
 */

// loading modules
const Dice = require('./dice.js');

/**
 * @description Rolls an Attribute
 * 
 * @param {Attribute} attribute 
 * 
 * @returns returns the dice roll for the attribute
 */
exports.rollAttribute = function (attribute, adv) {
    adv = adv || 0;
    return Dice.rollDice(
        [{
            diceQnt: 1,
            diceMax: 20,
            diceAdv: adv,
            diceBonus: 2 * attribute,
            explode: false
        }],
        false, true, false);
}

exports.rollInitiative = function (agility, adv) {
    adv = adv || 0;
    return Dice.rollDice(
        [{
            diceQnt: 1,
            diceMax: 20,
            diceAdv: adv,
            diceBonus: agility,
            explode: false
        }],
        false, true, false);
}

exports.rollDamage = function (attribute, adv) {
    adv = adv || 0;

    // set up dice to roll
    let dice = {};
    dice.diceAdv = adv;
    dice.diceBonus = 0;
    dice.explode = true;

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

    return Dice.rollDice([dice], false, true, false);
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

    switch (att) {
        case "agi":
        case "agility":
        case "agilidade":
        case "agil":
            ifValid("Agility");
            break;
            
        case "for":
        case "fort":
        case "fortitude":
            ifValid("Fortitude");
            break;
            
        case "mig":
        case "mgt":
        case "might":
        case "migth":
        case "str":
        case "força":
        case "forca":
            ifValid("Might")
            break;
            
        case "learning":
        case "lea":
        case "lear":
        case "learn":
        case "apre":
        case "apren":
        case "aprend":
        case "aprendizado":
            ifValid("Learning");
            break;
            
        case "logic":
        case "log":
        case "logica":
        case "lógica":
            ifValid("Logic");
            break;
            
        case "perc":
        case "perce":
        case "percep":
        case "perception":
        case "percepcao":
        case "percepçao":
        case "percepção":
            ifValid("Perception");
            break;

        case "wil":
        case "will":
        case "wil":
        case "wil":
        case "vontade":
        case "vont":
            ifValid("Will");
            break;

        case "dec":
        case "decep":
        case "deception":
        case "decepção":
        case "decepcão":
        case "decepçao":
        case "decepcao":
            ifValid("Deception");
            break;

        case "pers":
        case "persuasion":
        case "persuation":
        case "persuasao":
        case "persuazao":
        case "persuasão":
        case "persuazão":
            ifValid("Persuasion");
            break;
        
        case "prese":
        case "presence":
        case "presenca":
        case "presença":
            ifValid("Presence");
            break;    

        case "al":
        case "alt":
        case "alte":
        case "alter":
        case "alteration":
        case "alterasion":
        case "alteracao":
        case "alteracão":
        case "alteraçao":
        case "alteração":
            ifValid("Alteration"); 
            break;

        case "cre":
        case "crea":
        case "creat":
        case "creation":
        case "cri":
        case "cria":
        case "criacao":
        case "criacão":
        case "criaçao":
        case "criação":
            ifValid("Creation");
            break;    

        case "ene":
        case "ener":
        case "energy":
        case "energia":
            ifValid("Energy");
            break;    

        case "ent":
        case "entr":
        case "entropy":
        case "entropia":
            ifValid("Entropy");
            break;    

        case "inf":
        case "infl":
        case "influ":
        case "influence":
        case "influencia":
        case "influência":
            ifValid("Influence");
            break;    

        case "mov":
        case "move":
        case "movement":
        case "movi":
        case "movim":
        case "movimento":
            ifValid("Movement");
            break;    

        case "presc":
        case "presci":
        case "prescien":
        case "presciên":
        case "prescience":
        case "presciencia":
        case "presciência":
            ifValid("Prescience");
            break;    

        case "pro":
        case "prot":
        case "protec":
        case "protect":
        case "protection":
        case "proteç":
        case "proteção":
            ifValid("Protection");
            break;

        default:
            ifInvalid(att);
            return false;
            break;
    }

    return true;
}

exports.getMaxHP = function(char) {
    return
        10 +
        2 * char.Fortitude +
        2 * char.Presence + 
        1 * char.Will + 
        Math.floor(1.5 * char.Might) + 
        2 * char.Level;
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

    return
        10 +
        3 * char.Learning +
        2 * char.Will +
        Math.ceil(1.5 * maxSuper) +
        2 * char.Level;
}

exports.getMaxStamina = function(char) {
    return
        10 +
        3 * char.Fortitude +
        2 * char.Agility +
        1 * char.Might +
        1 * char.Level;
}

/**
 * @description tests if a string is a valid command for OL: FB. if yes, take care of it. if no, returns false.
 * 
 * @param {string} cmd          command string 
 * @param {Character} char      character 
 * 
 * @returns {string|boolean}    Either a string of the resolved command, or false if no valid command
 */
exports.command = function(cmd, char) {
// setting up the return message, and first word of command
    let msg = "", command = cmd.split(" ")[0].toLowerCase();

// testing for commands
    // if rolling "!attribute [advantage] [bonus]"
    if (exports.useAttribute(cmd.split(" ")[0]),
        (Attribute) => {
            let advBonus = getAdvBonus(cmd);
            msg += exports.rollAttribute(char[Attribute] + advBonus.bonus, advBonus.adv);
        }
    );
    // if rolling "!initiative"
    else if (command === "initiative" || command === "iniciative" ||
             command === "iniciativa") {
        let advBonus = getAdvBonus(cmd);
        msg += exports.rollInitiative(char.Agility + advBonus.bonus, advBonus.adv);
    }
    // if rolling "!damage [attribute]"

    // if it wasn't a valid command, return false
    else {
        return false;
    }
    
}

const getAdvBonus = function(cmd) {
    // try to get advantage (oh god why am i doing this)
    let advantageWords = Dice.getAdvWords().adv,
        disadvantageWords = Dice.getAdvWords().dis;
    let advRegStr = "(";
    for (i in advantageWords) {
        if (i != 0)
            advRegStr += "|";
        advRegStr += advantageWords[i];
    }
    advRegStr += ") *(\\++|-+)? *[0-9]*";
    let advRegExp = new RegExp(advRegStr, "i");
    let disRegStr = "(";
    for (i in disadvantageWords) {
        if (i != 0)
            disRegStr += "|";
            disRegStr += disadvantageWords[i];
    }
    disRegStr += ") *(\\++|-+)? *[0-9]*";
    let disRegExp = new RegExp(disRegStr, "i");

    let adv = 0;
    // if there is positive advantage
    if (advRegExp.test(cmd)) {
        let advStr = advRegExp.exec(cmd)[0];
        if (/- *[0-9]+/.test(advStr))
            adv = -1 * Number(/[0-9]+/.exec(cmd)[0]);
        else if (/\+ *[0-9]+/.test(advStr))
            adv =      Number(/[0-9]+/.exec(cmd)[0]);
        else
            adv = 1;
        
        cmd = cmd.slice(advRegExp.exec(cmd).index + advRegExp.exec(cmd)[0].length);
    }
    // if there is negative advantage
    else if (disRegExp.test(cmd)) {
        let advStr = disRegExp.exec(cmd)[0];
        if (/[0-9]+/.test(advStr))
            adv = -1 * Number(/[0-9]+/.exec(cmd)[0]);
        else
            adv = -1;
        
        cmd = cmd.slice(disRegExp.exec(cmd).index + disRegExp.exec(cmd)[0].length);
    }
    // get bonus
    let bonus = 0;
    if (/(\+|-) *[0-9]+/.test(cmd)) {
        // if the bonus is positive
        if (/\+ *[0-9]+/.test(cmd))
            bonus = Number(/[0-9]+/.exec(cmd)[0]);
        // if the bonus is negative
        if (/\- *[0-9]+/.test(cmd))
            bonus = -1 * Number(/[0-9]+/.exec(cmd)[0])
    }

    return {
        adv: adv,
        bonus: bonus
    };
}

// setting up constants /////////////////////////////////////////////////////////////////////////////////////////////////////////
const Agility = [
    "agi",
    "agil",
    "agilit",
    "agility",
    "agilidade"
];

const Fortitude = [
    "for",
    "fort",
    "fortitude"
];

const Might = [
    "mig",
    "mgt",
    "might",
    "mihgt",
    "str",
    "strength",
    "strenthg",
    "strenhtg",
    "forca",
    "força"
];

const Learning = [
    "lea",
    "lear",
    "learn",
    "learning",
    "apre",
    "apren",
    "aprend",
    "aprendiz",
    "aprendizado"
];

const Logic = [
    "log",
    "logi",
    "logic",
    "lóg",
    "lógi",
    "lógic",
    "lógica"
];

const Perception = [
    "perc",
    "perce",
    "percep",
    "perception",
    "percepcao",
    "percepçao",
    "percepção"
];

const Will = [
    "wil",
    "will",
    "wil",
    "wil",
    "vontade",
    "vont"
];

const Deception = [
    "dec",
    "decep",
    "deception",
    "decepção",
    "decepcão",
    "decepçao",
    "decepcao"
];

const Persuasion = [
    "pers",
    "persuasion",
    "persuation",
    "persuasao",
    "persuazao",
    "persuasão",
    "persuazão"
];

const Presence = [
    "prese",
    "presence",
    "presenca",
    "presença"
];

const Alteration = [
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
];

const Creation = [
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
];

const Energy = [
    "ene",
    "ener",
    "energy",
    "energia"
];

const Entropy = [
    "ent",
    "entr",
    "entropy",
    "entropia"
];

const Influence = [
    "inf",
    "infl",
    "influ",
    "influence",
    "influencia",
    "influência"    
];

const Movement = [
    "mov",
    "move",
    "movement",
    "movi",
    "movim",
    "movimento"
];

const Prescience = [
    "presc",
    "presci",
    "prescien",
    "presciên",
    "prescience",
    "presciencia",
    "presciência"
];

const Protection = [
    "pro",
    "prot",
    "protec",
    "protect",
    "protection",
    "proteç",
    "proteção"
];
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
 * @property {String} name
 * @property {String} system
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