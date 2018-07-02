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
const rollAttribute = function (attribute, adv) {
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

const rollAttack = function (attribute, adv) {
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

const rollInitiative = function (agility, adv) {
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

const rollDamage = function (attribute, adv, superExp) {
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
 * @description checks if cmdStr is a valid command, and executes it if yes.
 * 
 * @param {string} cmdStr 
 * @param {User}   user
 * 
 * @return {{msg: string, attach: {}}|boolean} 
 */
exports.checkCommand = function(cmdStr, user) {
    cmdStr = cmdStr.trim()
    let retVal = {
        msg: "",
        attach: {}
    }

    // check if has FB things
    if (user.hasOwnProperty("FB")) {
        // if is a command
        if (cmdStr.trim().slice(0, 1) === "!") {
            cmdStr = cmdStr.slice(1)
            
            // if creating character
            if (isCharCreate(cmdStr.split(" ")[0]))
                return charCreate(user)

            
            // if changing default character "!changeChar [charname]"
            else if (isInArray(cmdStr.split(' ')[0], CommandWords.changeChar)) {
                // if mentioned char name
                if (cmdStr.split(' ').length > 1 && isInArray(cmdStr.split(' ')[1], getCharNames(user))) {
                    let oldCharID = user.FB.activeCharId
                    user.FB.activeCharId = getCharID(cmdStr.split(' ')[1], user)

                    if (oldCharID === user.FB.activeCharId)
                        return {
                            msg: (user.FB.chars[oldCharID].name + " já é o personagem ativo!"),
                            attach: {}
                        }
                    else
                        return {
                            msg: ("Personagem ativo mudado, de **"+user.FB.chars[oldCharID].name + "** para **" + user.FB.chars[user.FB.activeCharId].name + "**"),
                            attach: {}
                        }
                    
                }
                // if not
                else {
                    const listChars = (chars) => {
                        let str = ""
                        for (i in chars)
                            str += "\t" + (1+Number(i)) + ". " + chars[i].name + "\n"

                        return (str + "\n")
                    }

                    user.FB.conversation = {
                        name: "changing character",
                        stage: 1
                    }

                    return {
                        msg: "E qual dos seus personagens você quer colocar como ativo?   ( ͡° ͜ʖ ͡°)\n\n"+listChars(user.FB.chars),
                        attach: {}
                    }
                }
            }

            // if using "!charName (command)"
            else if (isInArray(cmdStr.split(' ')[0], getCharNames(user))) {
                // this one takes care of "!charName" (displays bio)
                if (cmdStr.slice(cmdStr.split(' ')[0].length).trim() === "") return command("bio", user, user.FB.chars[getCharID(cmdStr.split(' ')[0].replace('!',''), user)])
                else return command(cmdStr.slice(cmdStr.split(' ')[0].length).trim(), user, user.FB.chars[getCharID(cmdStr.split(' ')[0].replace('!',''), user)])
            }
                
            // if using "!(command)"
            else
                return command(cmdStr, user)

        }
        
        // else if in a conversation about FB
        else if (user.FB.hasOwnProperty("conversation")) {
            return conversation(cmdStr, user)
        }
        // else, return false
        return false
    }
    // else, if creating a character
    else if (isCharCreate(cmdStr.split(" ")[0])) return charCreate(user)
    // else, go away.
    else return false;

}

/**
 * @description checks if att is a valid attribute name, then calls func(att) if so.
 * 
 * @param {string}   att        attribute to be used in function call
 * @param {Function} ifValid    function to be executed on valid attributes. uses att as argument
 * 
 * @returns {boolean} returns true if att is a valid attribute, false if not
 */
const useResource = function(res, ifValid) {
    ifValid = ifValid || (() => {});
    res = res.toLowerCase().trim();
    // iterate over all attributes
    for (resource in Resources) {
        // iterate over all possible names for an attribute
        for (resName of (Resources[resource])) {
            if (res === resName) {
                ifValid(resource);
                return true;
            }
        }
    }
    return false;
}

/**
 * @description tests if a string is a valid command for OL: FB. if yes, take care of it. if no, returns false.
 * 
 * @param {string}        cmd   command string 
 * @param {User}          user  user
 * @param {Character|Any} char  character (optional)
 * 
 * @returns {{msg: string, attach: {}}|boolean}    Either a string of the resolved command, or false if no valid command
 */
const command = function(cmd, user, char1) {
// setting up the return message, and first word of command
    let char = char1 || user.FB.chars[user.FB.activeCharId]
    let retVal = {
        msg: "",
        attach: {}
    }
    let command = cmd.trim().split(" ")[0].toLowerCase();
    let arg1;       // a segunda palavra do argumento
    if (cmd.trim().split(" ").length > 1)
        arg1 = cmd.trim().split(" ")[1].toLowerCase();

// testing for commands
    // if rolling "!attribute [(dis)advantage+x] [bonus]"
    if (useAttribute(command,
        (Attribute) => {
            let advBonus = getAdvBonus(cmd);
            let att = char[Attribute].base + char[Attribute].bonus
            retVal.msg += "**" + char.name + "**, rolando **" + Attribute + "**:\n";
            retVal.msg += rollAttribute(att + advBonus.bonus, advBonus.adv);
        }
    ));
    // if rolling "!initiative [(dis)advantage+x] [bonus]"
    else if (isInArray(command, CommandWords.iniciative)) {
        let advBonus = getAdvBonus(cmd);
        let agi = char.Agility.base + char.Agility.bonus
        retVal.msg += "Iniciativa para **" + char.name + "**:\n";
        retVal.msg += rollInitiative(agi + advBonus.bonus, advBonus.adv);
        retVal.msg += "\n\n |"+command+"|"
    }
    // if rolling "!damage [attribute] [(dis)advantage+x] [bonus]"
    else if (isInArray(command, CommandWords.damage)) {
        let attb = "";
        if (cmd.trim().split(" ").length > 1)
            attb = cmd.trim().split(" ")[1].toLowerCase();
        useAttribute(attb,
        // if there is an attribute, use it
            (Attribute) => {
                let advBonus = getAdvBonus(cmd);
                let att = Attribute.base + Attribute.bonus
                retVal.msg += "**" + char.name + "**, rolando dano para **" + Attribute + "**:\n";
                retVal.msg += rollDamage(att + advBonus.bonus, advBonus.adv);
            },
        // if there isn't an attribute, use the character's attack attribute
            () => {
                let advBonus = getAdvBonus(cmd);
                let att = attackAttribute.base + attackAttribute.bonus
                retVal.msg += "**" + char.name + "**, rolando dano para **" + char.attackAttribute + "**:\n";
                retVal.msg += rollDamage(att + advBonus.bonus, advBonus.adv);
            }
        );
    }
    // if rolling "!attack [attribute] [(dis)advantage+x] [bonus]"
    else if (isInArray(command, CommandWords.attack)) {

        let attb = "";
        if (cmd.trim().split(" ").length > 1)
            attb = cmd.trim().split(" ")[1].toLowerCase();
        useAttribute(attb,
        // if there is an attribute, use it
            (Attribute) => {
                let advBonus = getAdvBonus(cmd);
                let att = Attribute.base + Attribute.bonus
                retVal.msg += "**" + char.name + "**, rolando ataque para **" + Attribute + "**:\n";
                retVal.msg += rollAttack(att + advBonus.bonus, advBonus.adv);
            },
        // if there isn't an attribute, use the character's attack attribute
            () => {
                let advBonus = getAdvBonus(cmd);
                let att = attackAttribute.base + attackAttribute.bonus
                retVal.msg += "**" + char.name + "**, rolando ataque para **" + char.attackAttribute + "**:\n";
                retVal.msg += rollAttack(att + advBonus.bonus, advBonus.adv);
            }
        );
    }
    // if calculating damage "!damageCalc GUARD DODGE damage"
    else if (isInArray(command, CommandWords.damageCalculation)) {
        let guard = 0, dodge = 0, dmgIn = 0;
        // if guard and dodge inserted
        if (/(\+*|-*) *[0-9]+ +(\+*|-*) *[0-9]+ +[0-9]+/.test(cmd)) {
            let buffStr = /(\+*|-*) *[0-9]+/.exec(cmd)[0]
            cmd = cmd.slice(/(\+|-)* *[0-9]+/.exec(cmd).index + buffStr.length)
            if (buffStr.search('-') !== -1)
              guard = -1*Number(/[0-9]+/.exec(buffStr)[0])
            else
              guard =    Number(/[0-9]+/.exec(buffStr)[0])
            
            buffStr = /(\+*|-*) *[0-9]+/.exec(cmd)[0]
            cmd = cmd.slice(/(\+*|-*) *[0-9]+/.exec(cmd).index + buffStr.length)
            if (buffStr.search('-') !== -1)
              dodge = -1*Number(/[0-9]+/.exec(buffStr)[0])
            else
              dodge =    Number(/[0-9]+/.exec(buffStr)[0])
        
            buffStr = /(\+*|-*) *[0-9]+/.exec(cmd)[0]
            cmd = cmd.slice(/(\+*|-*) *[0-9]+/.exec(cmd).index + buffStr.length)
            if (buffStr.search('-') !== -1)
              dmgIn = -1*Number(/[0-9]+/.exec(buffStr)[0])
            else
              dmgIn =    Number(/[0-9]+/.exec(buffStr)[0])
        }
        // if damage inserted, but not guard or dodge
        else if (/[0-9]+/.test(cmd)) {
            dmgIn = /[0-9]+/.exec(cmd)[0]
            guard = char.Guard.base + char.Guard.bonus
            dodge = char.Dodge.base + char.Dodge.bonus
            retVal.msg += "**"+char.name+"**:\n\n"
        }
        // if no damage inserted
        else {
            retVal.msg  = "Use o comando direito idiota. Os formatos aceitáveis são:\n\n"
            retVal.msg += "\"!dmgCalc (GUARD) (DODGE) (dano)\"\n"
            retVal.msg += "\"!dmgCalc (dano)\"  (isso vai usar o dodge e guard do seu personagem ativo)"

            return retVal
        }

        let dmgOut = damageCalc(dmgIn, guard, dodge)
        retVal.msg += "dano **antes** da mitigação: "+dmgIn+"\n"
        retVal.msg += "(GUARD: "+guard+", DODGE: "+dodge+")\n\n"
        retVal.msg += "dano reduzido: "+(dmgIn-dmgOut)+"\n"
        retVal.msg += "dano tomado: "+dmgOut+"\n"
    }
    // if drawing a card
    else if (isInArray(command, CommandWords.draw)) {
        let char = user.FB.chars[user.FB.activeCharId]
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
    else if (isInArray(command, CommandWords.card) || ( (command === "use" || command === "usa") && (arg1 === "card" || arg1 === "carta"))) {
        let char = user.FB.chars[user.FB.activeCharId]
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

                user.FB.conversation.name  = "spendCardConfirm";
                user.FB.conversation.stage = 1;
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
                        
                    user.FB.conversation.name  = "spendCardConfirm";
                    user.FB.conversation.stage = 1;
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

                    user.FB.conversation.name  = "choseSpendCard";
                    user.FB.conversation.stage = 1;
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

                user.FB.conversation.name  = "choseSpendCard";
                user.FB.conversation.stage = 1;
                char.cardChosing = charCards;
            }
        }
    }
    // if changing or checking a resource (e.g.: "!HP -10")
    else if (useResource(command, (res) => {
        // if adding/removing the resource
        if (/(\+*|-*) *[0-9]+/.test(cmd)) {
            let resChange = Number(/[0-9]+/.exec(cmd)[0])
            if (/-/.test(cmd))
                resChange *= -1

            char[res].current += resChange

            if (char[res].current > char[res].max)
                char[res].current = char[res].max
            
            retVal.msg  = "**"+char.name+"**:\n"
            retVal.msg += "\t"+res+":   "+char[res].current+" / "+char[res].max
        }
        // if just checking
        else {
            retVal.msg  = "**"+char.name+"**:\n"
            retVal.msg += "\t"+res+":   "+char[res].current+" / "+char[res].max
        }
    }));
    // if changing an Attribute's bonus "!bonus (Attribute) +/-x"
    else if (isInArray(command, CommandWords.bonus) && useAttribute(cmd.split(' ')[1], 
        (att) => {
            if (cmd.split(' ').length < 3 || !/[0-9]+/.test(cmd)) {
                retVal.msg += "Aprenda a usar o comando. o formato certo é \"!bonus \'Atributo\' [+/-]x\""
                return
            }

            // if increasing bonus
            if (/\+/.test(cmd))
                char[att].bonus += Number(/[0-9]+/.exec(cmd)[0])
            // if decreasing bonus
            else if (/-/.test(cmd))
                char[att].bonus -= Number(/[0-9]+/.exec(cmd)[0])
            // if setting bonus to a fixed value
            else
                char[att].bonus = Number(/[0-9]+/.exec(cmd)[0])
            
            retVal.msg += "**" + char.name + "**:\n"
            retVal.msg += att + ": " + char[att].base
            if (char[att].bonus >= 0)
                retVal.msg += " (+" + char[att].bonus + ")"
            else
                retVal.msg += " (" + char[att].bonus + ")"

        },
        () => {
        }
    ));
    // if changing a defense's bonus "!bonus (defense) +/- x"
    else if (isInArray(command, CommandWords.bonus) && useDefense(cmd.split(' ')[1],
        (def) => {
            if (cmd.split(' ').length < 3 || !/[0-9]+/.test(cmd)) {
                retVal.msg += "Aprenda a usar o comando. o formato certo é \"!bonus Guard/Dodge [+/-]x\""
                return
            }

            // if increasing bonus
            if (/\+/.test(cmd))
                char[def].bonus += Number(/[0-9]+/.exec(cmd)[0])
            // if decreasing bonus
            else if (/-/.test(cmd))
                char[def].bonus -= Number(/[0-9]+/.exec(cmd)[0])
            // if setting bonus to a fixed value
            else
                char[def].bonus = Number(/[0-9]+/.exec(cmd)[0])
            
            retVal.msg += "**" + char.name + "**:\n"
            retVal.msg += def + ": " + char[def].base
            if (char[def].bonus >= 0)
                retVal.msg += " (+" + char[def].bonus + ")"
            else
                retVal.msg += " (" + char[def].bonus + ")"

        },
        () => {
        }
    ));
    // if changing a Resource's maximum value "!setMax (Resource) x"
    else if (isInArray(command, CommandWords.setMax) && useResource(cmd.split(' ')[1], 
    (res) => {
        if (cmd.split(' ').length < 3 || !/[0-9]+/.test(cmd)) {
            retVal.msg += "Aprenda a usar o comando. o formato certo é \"!setMax \'HP/MP/Stamina\' x\""
            return
        }
        
        char[res].current = char[res].max = Number(/[0-9]+/.exec(cmd)[0])
        
        retVal.msg += "**" + char.name + "**:\n"
        retVal.msg += res + ": " + char[res].current + " / " + char[res].max

    },
    () => {
    }
    ));
    // if changing an Attribute's base value "!set (Attribute) x"
    else if (isInArray(command, CommandWords.set) && useAttribute(cmd.split(' ')[1], 
    (att) => {
        if (cmd.split(' ').length < 3 || !/[0-9]+/.test(cmd)) {
            retVal.msg += "Aprenda a usar o comando. o formato certo é \"!set \'Atributo\' x\""
            return
        }
        
        if (/-/.test(cmd))
            char[att].base = -1 * Number(/[0-9]+/.exec(cmd)[0])
        else
            char[att].base = Number(/[0-9]+/.exec(cmd)[0])
        
        retVal.msg += "**" + char.name + "**:\n"
        retVal.msg += att + ": " + char[att].base
        if (char[att].bonus >= 0)
            retVal.msg += " (+" + char[att].bonus + ")"
        else
            retVal.msg += " (" + char[att].bonus + ")"

    },
    () => {
    }
    ));
    // if changing a Defense's base value "!set (Defense) x"
    else if (isInArray(command, CommandWords.set) && useDefense(cmd.split(' ')[1], 
    (def) => {
        if (cmd.split(' ').length < 3 || !/[0-9]+/.test(cmd)) {
            retVal.msg += "Aprenda a usar o comando. o formato certo é \"!set \'Atributo\' x\""
            return
        }
        
        if (/-/.test(cmd))
            char[def].base = -1 * Number(/[0-9]+/.exec(cmd)[0])
        else
            char[def].base = Number(/[0-9]+/.exec(cmd)[0])
        
        retVal.msg += "**" + char.name + "**:\n"
        retVal.msg += def + ": " + char[def].base
        if (char[def].bonus >= 0)
            retVal.msg += " (+" + char[def].bonus + ")"
        else
            retVal.msg += " (" + char[def].bonus + ")"

    },
    () => {
    }
    ));
    // if checking a character's bio (THIS SHOULD ALWAYS BE THE LAST COMMAND CHECKED, BECAUSE OF THE "isInArray(command, getCharNames(user))" PART)
    else if (isInArray(command, CommandWords.bio)) {

        const getBonusStr = (bonus) => {
            if (bonus < 0) return " ("+bonus+")"
            if (bonus > 0) return " (+"+bonus+")"
            else return ""
        }

        let msg = "";

        msg += "**"+char.name+"**\n\n"
        msg += "HP:   **"+char.HP.current       +" / "+char.HP.max + "**\n"
        msg += "MP:   **"+char.MP.current       +" / "+char.MP.max + "**\n"
        msg += "MP:   **"+char.Stamina.current  +" / "+char.Stamina.max + "**\n\n"

        msg += "**GUARD**: "+char.Guard.base + getBonusStr(char.Guard.bonus) + "\n"
        msg += "**DODGE**: "+char.Dodge.base + getBonusStr(char.Dodge.bonus) + "\n\n"

        msg += "**Physical**:\n"
        msg += "\tAgility: "    + char.Agility.base     + getBonusStr(char.Agility.bonus)     + "\n"
        msg += "\tFortitude: "  + char.Fortitude.base   + getBonusStr(char.Fortitude.bonus)   + "\n"
        msg += "\tMight: "      + char.Might.base       + getBonusStr(char.Might.bonus)       + "\n\n"
        
        msg += "**Mental**:\n"
        msg += "\tLearning: "   + char.Learning.base    + getBonusStr(char.Learning.bonus)   + "\n"
        msg += "\tLogic: "      + char.Logic.base       + getBonusStr(char.Logic.bonus)      + "\n"
        msg += "\tPerception: " + char.Perception.base  + getBonusStr(char.Perception.bonus) + "\n"
        msg += "\tWill: "       + char.Will.base        + getBonusStr(char.Will.bonus)       + "\n\n"

        msg += "**Social**:\n"
        msg += "\tDeception: "  + char.Deception.base   + getBonusStr(char.Deception.bonus)  + "\n"
        msg += "\tPersuasion: " + char.Persuasion.base  + getBonusStr(char.Persuasion.bonus) + "\n"
        msg += "\tPresence: "   + char.Presence.base    + getBonusStr(char.Presence.bonus)   + "\n\n"

        msg += "**Extraordinary**:\n"
        msg += "\tAlteration: " + char.Alteration.base  + getBonusStr(char.Alteration.bonus) + "\n"
        msg += "\tCreation: "   + char.Creation.base    + getBonusStr(char.Creation.bonus)   + "\n"
        msg += "\tEnergy: "     + char.Energy.base      + getBonusStr(char.Energy.bonus)     + "\n"
        msg += "\tEntropy: "    + char.Entropy.base     + getBonusStr(char.Entropy.bonus)    + "\n"
        msg += "\tInfluence: "  + char.Influence.base   + getBonusStr(char.Influence.bonus)  + "\n"
        msg += "\tMovement: "   + char.Movement.base    + getBonusStr(char.Movement.bonus)   + "\n"
        msg += "\tPrescience: " + char.Prescience.base  + getBonusStr(char.Prescience.bonus) + "\n"
        msg += "\tProtection: " + char.Protection.base  + getBonusStr(char.Protection.bonus) + "\n"

        retVal.msg = msg
    }
    // else, return false
    else {
        return false;
    }

    if (retVal.msg !== "")
        return retVal
    else 
        return {msg: "programmer fucked up", attach: {}}
}
// exports.command = command

const conversation = function(cmd, user) {
    let retVal = {
        msg: "",
        attach: {}
    }

    // creating char
    if (user.FB.conversation.name === "creating character") {
        let char = user.FB.chars[user.FB.chars.length-1]

        switch (user.FB.conversation.stage) {
            // recieving the character's name
            case 1:

                char.name = cmd.trim()
                retVal.msg = "Então o nome do seu personagem é \""+cmd.trim()+"\"?"
                user.FB.conversation.stage++
                user.FB.conversation.stage = 2
                break;
            // confirming the character's name
            case 2:
                // if yes
                if (isYes(cmd)) {
                    retVal.msg = "E quanto "+ char.name +" tem de HP máximo?"
                    user.FB.conversation.stage++
                    break;
                }
                // if no
                else {
                    retVal.msg = "Então qual é a porra do nome?"
                    user.FB.conversation.stage = 1
                    break;
                }
            // getting max HP, MP and Stamina
            case 3:
            case 4:
            case 5:
                // set up resource names
                let resourceName, nextResource;
                     if (user.FB.conversation.stage === 3) { resourceName = "HP"; nextResource = "MP"       }
                else if (user.FB.conversation.stage === 4) { resourceName = "MP"; nextResource = "Stamina"  }
                else if (user.FB.conversation.stage === 5) { resourceName = "Stamina"; nextResource = false }
                // if NaN entered
                if (isNaN(Number(cmd.trim()))) {
                    retVal.msg = "\"" + cmd.trim() + "\" não é um número. Quanto de "+ resourceName +" máximo seu personagem tem?"
                }
                // if number entered
                else {
                    let char = user.FB.chars[user.FB.chars.length-1]
                    char[resourceName] = {
                        max:     Number(cmd.trim()),
                        current: Number(cmd.trim())
                    }
                    
                    if (nextResource)
                        retVal.msg = Number(cmd.trim()) +" de "+ resourceName +". Quanto de "+ nextResource +" máximo seu personagem tem?"
                    else
                        retVal.msg = "Ok! E quanto "+ char.name +" tem de Agility?"

                    user.FB.conversation.stage++
                }
                break;
            // get the Attributes
            case  6: case  7: case  8: case  9: case 10: case 11: case 12: case 13: case 14: case 15:
            case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 23:
                // set up resource names
                let attributeName = "", nextAtt = ""
                let attID = user.FB.conversation.stage
                     if (attID ===  6) { attributeName = "Agility"    ; nextAtt = "Fortitude"   }
                else if (attID ===  7) { attributeName = "Fortitude"  ; nextAtt = "Might"       }
                else if (attID ===  8) { attributeName = "Might"      ; nextAtt = "Learning"    }
                else if (attID ===  9) { attributeName = "Learning"   ; nextAtt = "Logic"       }
                else if (attID === 10) { attributeName = "Logic"      ; nextAtt = "Perception"  }
                else if (attID === 11) { attributeName = "Perception" ; nextAtt = "Will"        }
                else if (attID === 12) { attributeName = "Will"       ; nextAtt = "Deception"   }
                else if (attID === 13) { attributeName = "Deception"  ; nextAtt = "Persuasion"  }
                else if (attID === 14) { attributeName = "Persuasion" ; nextAtt = "Presence"    }
                else if (attID === 15) { attributeName = "Presence"   ; nextAtt = "Alteration"  }
                else if (attID === 16) { attributeName = "Alteration" ; nextAtt = "Creation"    }
                else if (attID === 17) { attributeName = "Creation"   ; nextAtt = "Energy"      }
                else if (attID === 18) { attributeName = "Energy"     ; nextAtt = "Entropy"     }
                else if (attID === 19) { attributeName = "Entropy"    ; nextAtt = "Influence"   }
                else if (attID === 20) { attributeName = "Influence"  ; nextAtt = "Movement"    }
                else if (attID === 21) { attributeName = "Movement"   ; nextAtt = "Prescience"  }
                else if (attID === 22) { attributeName = "Prescience" ; nextAtt = "Protection"  }
                else if (attID === 23) { attributeName = "Protection" ; nextAtt = false         }

                // if NaN entered
                if (isNaN(Number(cmd.trim()))) {
                    retVal.msg = "\"" + cmd.trim() + "\" não é um número. Quanto "+char.name+" tem de "+ attributeName +"?"
                }
                // if number entered 
                else {
                    if (nextAtt)
                        retVal.msg = ""+ Number(cmd.trim()) +" de "+ attributeName +". Quanto de "+ nextAtt +" máximo seu personagem tem?"
                    else
                        retVal.msg = "Ok! terminamos os atributos. E qual atributo "+ char.name +" usa pra atacar?"
                    
                    user.FB.conversation.stage++
                    char[attributeName] = {
                        base: Number(cmd.trim()),
                        bonus: 0
                    }
                }
                break;
                
            // recieving the attack attribute
            case 24:
                useAttribute(cmd, 
                    (attr) => {
                        let att = firstLetter2Upper(attr)
                        retVal.msg  = "Ok, então o atributo que "+char.name+" usa pra atacar é "+ att
                        retVal.msg += ". E qual é o atributo do dado de HP do seu personagem?"
                        retVal.msg += " (pergunte pro mestre o que isso significa se você não sabe)"
                        char.attackAttribute = att
                        user.FB.conversation.stage++
                    },
                    (command) => {
                        retVal.msg = "\""+ command + "\" não é um atributo válido. aprenda a escrever"
                    }
                )
                break;

            // recieving the HP and MP dice Attribute
            case 25:
            case 26:
                var curResource = "", nxtResource;
                if (user.FB.conversation.stage === 25) {
                    curResource = "HP"; nxtResource = "MP"
                } else {
                    curResource = "MP"; nxtResource = false
                }
                useAttribute(cmd, 
                    (attr) => {
                        let att = firstLetter2Upper(attr)
                        retVal.msg  = "Ok, então o atributo que "+char.name+" usa para seu dado de "+curResource+" é "+ att + "."
                        char[""+curResource+"dice"] = att
                        if (nxtResource) {
                            retVal.msg += " E qual é o atributo do dado de "+nxtResource+" do seu personagem?"
                            retVal.msg += " (pergunte pro mestre o que isso significa se você não sabe)"
                        } else {
                            retVal.msg += " E quanto "+ char.name +" tem de Guard?"
                        }
                        user.FB.conversation.stage++
                    },
                    (command) => {
                        retVal.msg = "\""+ command + "\" não é um atributo válido. aprenda a escrever"
                    }
                )
                break;

            // recieving character's guard
            case 27:
                // if NaN entered
                if (isNaN(Number(cmd.trim()))) {
                    retVal.msg = "\"" + cmd.trim() + "\" não é um número. Quanto "+char.name+" tem de Guard?"
                }
                // if number entered 
                else {
                    retVal.msg = ""+ Number(cmd.trim()) +" de Dodge. Quanto de Dodge seu personagem tem?"
                    char.Guard = {
                        base: Number(cmd.trim()),
                        bonus: 0
                    }
                    user.FB.conversation.stage++
                }
                break;

            // recieving character's dodge
            case 28:
                // if NaN entered
                if (isNaN(Number(cmd.trim()))) {
                    retVal.msg = "\"" + cmd.trim() + "\" não é um número. Quanto "+char.name+" tem de Dodge?"
                }
                // if number entered 
                else {
                    retVal.msg = ""+ Number(cmd.trim()) +" de Dodge. Criação de personagem completa!"
                    char.Dodge = {
                        base: Number(cmd.trim()),
                        bonus: 0
                    }
                    // ENDING CONVERSATION ////////////////////////////////////////////////////////////////////
                        user.FB.conversation.name  = ""
                        user.FB.conversation.stage = 0
                        user.FB.activeCharId = user.FB.chars.length-1
                    // ENDING CONVERSATION ////////////////////////////////////////////////////////////////////
                }
                break;

            default:
                retVal.msg = "estágio de conversa de criação de personagem inválido. o Ragan fez merda no código"
                break;
        }
    }
    // overriding char creation
    else if (/character creation override/.test(user.FB.conversation.name)) {
        let charStage = Number(/[0-9]+/.exec(user.FB.conversation.name)[0])
        
        // if yes
        if (isYes(cmd)) {
            retVal.msg = "Okay. Reiniciando cração de personagem. Qual o nome do seu personagem?"
            user.FB.conversation.stage = 1
            user.FB.conversation.name = "creating character"
        }
        // if no
        else {
            retVal.msg = "Okay, seu indeciso de merda.\n\nDigite algo para continuar a criação de personagem pausada..."
            user.FB.conversation.stage = charStage
            user.FB.conversation.name = "creating character"
        }
    }
    // chosing card to spend
    else if (user.FB.conversation.name === "choseSpendCard") {
        let char = user.FB.chars[user.FB.activeCharId]
        let card = cards.namesCard(cmd, char.cardChosing);
        // if valid card was mentioned
        if (card.length >= 1) {
            card = card[0];
            char.cardSpending = card;
            char.FB.conversation = "spendCardConfirm";

            retVal.msg += "Tem certeza que quer usar ";
            if (card.search("Q") !== -1)
                retVal.msg += "a ";
            else
                retVal.msg += "o ";
            retVal.msg += cards.getCardName(card) + "?";
        }
        // if called it by number
        else if (!Number.isNaN(cmd.trim()) && Number(cmd.trim()) > 0 && Number(cmd.trim()) <= char.cardChosing.length) {
            card = char.cardChosing[Number(cmd.trim())-1];
            char.cardSpending = card;
            user.FB.conversation.name  = "spendCardConfirm";
            user.FB.conversation.stage = 1;

            retVal.msg += "Tem certeza que quer usar ";
            if (card.search("Q") !== -1)
                retVal.msg += "a ";
            else
                retVal.msg += "o ";
            retVal.msg += cards.getCardName(card) + "?";
        }
        // if no valid card was mentioned
        else {
            retVal.msg += "Opção inválida! Idiota.";
            user.FB.conversation = {name: "", stage: 0};
        }
    }
    // confirming card to spend
    else if (user.FB.conversation.name === "spendCardConfirm") {
        let char = user.FB.chars[user.FB.activeCharId]
        let command = cmd.trim().split(" ")[0].toLowerCase().trim();
        if (command === "yes" || command === "y" || command === "sim" || command === "s") {
            retVal.msg += cards.getCardName(char.cardSpending) + " usad";
            if (char.cardSpending.search("Q") !== -1)
                retVal.msg += "a. ";
            else
                retVal.msg += "o. ";
            if (char.cardSpending.search("JOKER") !== -1)
                retVal.msg += char.name + " ganha o seguinte efeito:\n\n";
            else
                retVal.msg += char.name + " ganha os seguintes efeitos:\n\n";
            
            retVal.msg += cards.getCardEffects(char.cardSpending);

            char.cards[char.cardSpending]--;
            if (char.cards[char.cardSpending] === 0)
                delete char.cards[char.cardSpending];
            if (Object.keys(char.cards).length === 0)
                delete char.cards;
            delete char.conversation;
            delete char.cardSpending;
        }
        else if (command === "nao" || command === "não" || command === "no" || command === "n") {
            retVal.msg += "Ok! então a carta não será usada.";
            delete char.cardSpending;
            user.FB.conversation = {name: "", stage: 0}
        }
        else {
            retVal.msg += "Eu não entendi. aprende a escrever, oh idiota.";
        }
    }
    // chosing active character
    else if (user.FB.conversation.name === "changing character") {
        // console.log("getCharNames(user): ")
        // console.log(getCharNames(user))
        // if used a number
        if (/[0-9]+/.test(cmd)) {
            let oldCharID = user.FB.activeCharId
            user.FB.activeCharId = Number(/[0-9]+/.exec(cmd)[0])-1

            if (oldCharID === user.FB.activeCharId)
                retVal.msg = user.FB.chars[oldCharID].name + " já é o personagem ativo!"
            else if (user.FB.activeCharId >= user.FB.chars.length) {
                user.FB.activeCharId = oldCharID
                retVal.msg = "Número inválido!"
            }
            else
                retVal.msg = "Personagem ativo mudado, de **"+user.FB.chars[oldCharID].name + "** para **" + user.FB.chars[user.FB.activeCharId].name + "**"
        }
        // if used the name
        else if (isInArray(cmd.split(' ')[0], getCharNames(user))) {
            let oldCharID = user.FB.activeCharId
            user.FB.activeCharId = getCharID(cmd.split(' ')[0], user)

            if (oldCharID === user.FB.activeCharId)
                retVal.msg = user.FB.chars[oldCharID].name + " já é o personagem ativo!"
            else
                retVal.msg = "Personagem ativo mudado, de **"+user.FB.chars[oldCharID].name + "** para **" + user.FB.chars[user.FB.activeCharId].name + "**"
        }
        // if invalid
        else {
            retVal.msg = "Resposta inválida. Aprenda a escrever, idiota."
        }
        
        user.FB.conversation.name  = ""
        user.FB.conversation.stage = 0
    }

    // if (msg === "")
    //     delete user.FB.conversation;

    return retVal;
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
    }
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

const Defenses = {
    Dodge: [
        "dodge"
    ],
    Guard: [
        "guard",
        "guarda"
    ]
}

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
        "stam",
        "stm",
        "estamina"
    ]
};

const CommandWords = {
    damage: [
        "dmg",
        "damg",
        "damag",
        "dano",
        "damage"
    ],
    iniciative: [
        "initiative",
        "iniciative",
        "iniciativa",
        "init"
    ], 
    draw: [
        "draw",
        "drawcard"
    ],
    card: [
        "card",
        "carta",
        "usecard",
        "usacard",
        "usecarta",
        "usacarta"
    ],
    bio: [
        "bio",
        "sheet",
        "ficha"
    ],
    attack: [
        "ataque",
        "attack",
        "atk",
        "attaque",
        "ataq",
        "attk",
        "atake",
        "atq"
    ],
    damageCalculation: [
        "dmgcalc",
        "calc",
        "calculo",
        "dmgcalculo",
        "calculodano",
        "calculodedano",
        "calcdano",
        "danocalc",
        "danocalculo"
    ],
    bonus: [
        "bonus",
        "bônus"
    ],
    set: [
        "set",
        "seta",
        "setbase"
    ],
    setMax: [
        "setmax"
    ],
    changeChar: [
        "changechar",
        "changechars",
        "changedefaultchar",
        "changedefaultchars",
        "changecharacter",
        "changecharacters"
    ]
}
// setting up constants /////////////////////////////////////////////////////////////////////////////////////////////////////////

// stupid helper functions ------------------------------------------------------------------------------------------------------
const isYes = (str) => {
    return (/y/i.test(str) || /s/i.test(str) || /yes/i.test(str) || /sim/i.test(str) || /uhum/i.test(str) || /aham/i.test(str) || /yep/i.test(str))
}
const isCharCreate = (str) => { 
    return (/(createchar|charcreate)/i.test(str.split(" ")[0]) || (/create/i.test(str.split(" ")[0]) && /create/i.test(str.split(" ")[1])));
}
const charCreate = (user) => {
    const retVal = {
        msg: "",
        attach: {}
    }
    if (!user.hasOwnProperty("FB"))
        user.FB = {conversation: {name: "", stage: 0}}
        
    // if already creating a character
    if (user.FB.conversation.name === "creating character") {
        retVal.msg = "Você já está no meio da criação de um personagem. Quer descartar esse personagem incompleto e criar outro?";
        user.FB.conversation.name = "character creation override? "+user.FB.conversation.stage;
        user.FB.conversation.stage = 0;
        
    }
    // else, start character creation process
    else {
        user.FB.conversation.name = "creating character"
        user.FB.conversation.stage = 1
        
        if (!user.FB.hasOwnProperty("chars"))
            user.FB.chars = []
        user.FB.chars.push({})

        retVal.msg = "Qual o nome do seu personagem?"
    }
    return retVal
}
const firstLetter2Upper = (str) => {
    return (str[0].toUpperCase() + str.slice(1).toLowerCase())
}

/**
 * @description calculate damage mitigation
 * 
 * @param {number} dmgIn 
 * @param {number} guard 
 * @param {number} dodge 
 */
const damageCalc = (dmgIn, guard, dodge) => {
    guard = guard || 0
    dodge = dodge || 0
    if (dodge < 0) dodge = 0
    return Math.floor(dmgIn*(15/(dodge+15)) - guard)
}

/**
 * @description returns the names of all of the @param user's characters' names
 * 
 * @param {User} user
 * 
 * @returns {string[]} 
 */
const getCharNames = (user) => {
    let retVal = []
    for (char of user.FB.chars) {
        retVal.push(char.name.trim().toLowerCase())
    }
    return retVal
}

/**
 * @description returns the id of a character
 * 
 * @param {string}  name
 * @param {User}    user
 * 
 * @returns {number|boolean} the char's id, or false if not found
 */
const getCharID = (name, user) => {
    let id = 0
    let regExp = new RegExp(name.trim(), "i");
    for (char of user.FB.chars)
        if (regExp.test(char.name)) return id
        else id++

    return false
}

/**
 * @description checks if @param _str is equal to one of the elements in @param arr
 * 
 * @param {string} _str 
 * @param {string[]} arr
 * 
 * @returns {boolean} 
 */
const isInArray = (str, arr) => {
    if (str === "") return false

    let regExp = new RegExp(str.trim(), "i");

    for (s of arr)
        if (regExp.test(s))
            return s

    return false
}

/**
 * @description checks if att is a valid attribute name, then calls func(att) if so.
 * 
 * @param {string}   att        attribute to be used in function call
 * @param {Function} ifValid    function to be executed on valid attributes. uses att as argument
 * @param {Function} ifInvalid  function to be executed on invalid attributes. uses att as argument
 * 
 * @returns {boolean} returns true if att is a valid attribute, false if not
 */
const useAttribute = function (att, ifValid, ifInvalid) {
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

/**
 * @description checks if att is a valid defense (Guard, Dodge) name, then calls func(att) if so.
 * 
 * @param {string}   def        attribute to be used in function call
 * @param {Function} ifValid    function to be executed on valid attributes. uses att as argument
 * @param {Function} ifInvalid  function to be executed on invalid attributes. uses att as argument
 * 
 * @returns {boolean} returns true if att is a valid attribute, false if not
 */
const useDefense = function (def, ifValid, ifInvalid) {
    ifValid = ifValid || (() => {});
    ifInvalid = ifInvalid || (() => {});
    def = def.toLowerCase().trim();

    // iterate over all attributes
    for (defense in Defenses) {
        // iterate over all possible names for an attribute
        for (defenseName of (Defenses[defense])) {
            if (def === defenseName) {
                ifValid(defense);
                return true;
            }
        }
    }
    ifInvalid(def);
    return false;
}
// stupid helper functions ------------------------------------------------------------------------------------------------------

/**
 * @typedef Attribute
 * 
 * @property {number} base
 * @property {number} bonus
 */

/**
 * @typedef Resource
 * 
 * @property {number} max
 * @property {number} current
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
 * @property {Attribute} Agility    
 * @property {Attribute} Fortitude  
 * @property {Attribute} Might      
 * 
 * @property {Attribute} Learning   
 * @property {Attribute} Logic      
 * @property {Attribute} Perception 
 * @property {Attribute} Will       
 * 
 * @property {Attribute} Deception  
 * @property {Attribute} Persuasion 
 * @property {Attribute} Presence   
 * 
 * @property {Attribute} Alteration 
 * @property {Attribute} Creation   
 * @property {Attribute} Energy     
 * @property {Attribute} Entropy    
 * @property {Attribute} Influence  
 * @property {Attribute} Movement   
 * @property {Attribute} Prescience 
 * @property {Attribute} Protection
 */

 /**
  * @typedef User
  * 
  * @property {FB} FB
  */

 /**
  * @typedef FB
  * 
  * @property {Character[]} chars
  * @property {number}      activeCharId
  * @property {name: string, stage: number} conversation
  */