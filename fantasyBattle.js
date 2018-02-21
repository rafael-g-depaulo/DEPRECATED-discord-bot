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
exports.rollAttribute = function (attribute) {
    return Dice.rollDice(
        [{
            diceQnt: 1,
            diceMax: 20,
            diceAdv: 0,
            diceBonus: 2 * attribute,
            explode: false
        }],
        false, true, false);
}

exports.rollInitiative = function (agility) {
    return Dice.rollDice(
        [{
            diceQnt: 1,
            diceMax: 20,
            diceAdv: 0,
            diceBonus: agility,
            explode: false
        }],
        false, true, false);
}

exports.rollDamage = function (attribute) {

    // set up dice to roll
    let dice = {};
    dice.diceAdv = 0;
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
 * @param {String} att          attribute to be used in function call
 * @param {Function} ifValid    function to be executed on valid attributes. uses att as argument
 * @param {Function} ifInvalid  function to be executed on invalid attributes. uses att as argument
 * 
 * @returns {Boolean} returns true if att is a valid attribute, false if not
 */
exports.useAttribute = function (att, ifValid, ifInvalid) {
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

exports.defaultHP = {};
Object.defineProperty(exports, "defaultHP", {
    writable: false
});

console.log(exports.defaultHP);