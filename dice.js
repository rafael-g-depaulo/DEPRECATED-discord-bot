/**
 * @author Rafael 'Ragan' Gonçalves
 * @fileOverview Manages dicerolls. that's pretty much it
 */

/**
 * @typedef {Object} Roll
 * 
 * @property {Number} diceQnt       The quantity of that die to be rolled
 * @property {Number} diceMax       The maximum roll the die may reach
 * @property {Number} diceAdv       The ammount of advantage/disadvantage the roll has
 * @property {Number} diceBonus     The bonus to be added to the roll
 * @property {Boolean} explode      Whether the dice should explode or not
 * @property {Boolean} superExplode Whether the dice should explode on the maximum, or the maximum AND the maximum-1
 */

/**
 * @typedef {Object} RollResults
 * 
 * @property {string} list      The string representing the list of dice roll results
 * @property {string} sum       The string representing the sum of dice roll results
 * @property {Number} resultSum The sum of all of the dice rolls
 */

/**** constants *****************************************************************/ 

// array of words that represent the roll command
const rollCmdWords = [
    "roll",
    "rol",
    "rolagem",
    "rolamento"
];

// array of words that represent advantage
const advantageWords = [
    "advantage",
    "advantadge",
    "vantagem",
    "vantajem",
    "adv",
    "van",
    "vant",
];

// array of words that represent disadvantage
const disadvantageWords = [
    "disadvantage",
    "disadvantadge",
    "dis",
    "disv",
    "disvant",
    "dvan",
    "dvant",
    "disvantagem",
    "desvantagem",
    "desv",
    "des",
]

const sumWords = [
    "sum",
    "soma",
    "some"
]
/**** constants *****************************************************************/ 

/**
 * @description check if a command is a valid dice roll
 * 
 * @param {string} args The string representing the command & arguments 
 * 
 * @returns {Boolean} Wether the args represent at least one dice roll command
 */
exports.isDiceRollCmd = function(args) {

    // if there is a valid roll command, return true
    let regExpStr = "(";
    for (i in rollCmdWords) {
        if (i != 0)
            regExpStr += "|";
            regExpStr += rollCmdWords[i];
    }
    regExpStr += ")";
    let regExp = new RegExp(regExpStr, "i");
    if (regExp.test(args))
        return true;

    // check if the user entered a valid dice roll without a command, (yes=>return true,no=>return false)
    if (/[0-9]* *d *[0-9]+/i.test(args))
        return true;
    else
        return false;
}

/**
 * @description rolls the dice in the dice param and returns the appropriate string
 * 
 * @param {Roll[]} diceArgs Array of dice to be rolled
 * @param {Boolean} list    Wether or not the results should be listed
 * @param {Boolean} sum     Wether or not the results should be summed
 * @param {Boolean} sumRes  Wether or not the total dice roll results should be summed
 * 
 * @returns {string}
 */
exports.rollDice = function(diceArgs, list, sum, sumRes) {
    // if dice isn't an array, a mistake has been made
    if (diceArgs.constructor !== Array)
        return "Error: programmer fucked up!\n";
        
    // set up return variable
    let str = "";
    let rollSum = 0;
    let rollSumStr = "";

    // if no dice are given, use default
    if (diceArgs.length === 0) {
        let die = {};
        die.diceAdv = 0;
        die.diceBonus = 0;
        die.diceQnt = 1;
        die.diceMax = 20;
        die.explode = false;
        diceArgs.push(die);
    }

// set up return string
    for (let i = 0; i < diceArgs.length; i++) {
    // roll the dice and get the results
        let rollResult = rollDie(diceArgs[i]);

    // if more then one roll, numer the rolls
        if (diceArgs.length !== 1)
            str += (i+1).toString() + ") ";

    // add roll arguments
        str += "__**" + diceArgs[i].diceQnt + "d" + diceArgs[i].diceMax;
        if (diceArgs[i].explode)
            str += "!";
        if (diceArgs[i].diceBonus > 0)
            str += " +" + diceArgs[i].diceBonus;
        else if (diceArgs[i].diceBonus < 0)
            str += " " + diceArgs[i].diceBonus;
        if (diceArgs[i].diceAdv > 0)
            str += " adv+" + diceArgs[i].diceAdv;
        if (diceArgs[i].diceAdv < 0)
            str += " dis" + diceArgs[i].diceAdv;
        
        str += "**__: ";

    // summing and/or listing the results in the return string
        // if supposed to list but not sum
        if (list && !sum) {
            str += rollResult.list;
        }
        // if supposed to sum but not list
        else if (sum && !list) {
            str += rollResult.sum;
        }
        // else, list and sum
        else {
            str += rollResult.list;

            // se mais de um dado, ou tem bonus
            if (diceArgs[i].diceBonus !== 0 || diceArgs[i].diceQnt > 1)
                str += ";\n\t" + rollResult.sum;
        }

    // if there are more rolls aftert
        if (i !== diceArgs.length-1)
            str += ";\n\n";

    // making the roll sum str
        if (sumRes && diceArgs.length > 1) {
        // adding the current roll to the numerical result and to the string
            rollSum += Number(rollResult.resultSum);
            rollSumStr += "" + rollResult.resultSum;
        
        // taking care of "+" and "="
            if (i < diceArgs.length-1)
                rollSumStr += " + ";
            else
                rollSumStr += " = **" + rollSum + "**";
        }
    }

// add the roll sum to return string, if suposed to
    if (sumRes && diceArgs.length > 1)
        str += "\n\n\t**Soma:** " + rollSumStr + ";\n";

// return the result
    return str;
}

/**
 * @description rolls the dice in param and returns apropriate string
 * 
 * @param {Roll} die The dice to be rolled
 * 
 * @returns {RollResults}
 */
const rollDie = function(die) {
// roll the dice
    let numRolls = [];
    for (let i = 0; i < die.diceQnt + Math.abs(die.diceAdv); i++)
        numRolls.push(Math.floor(Math.random() * die.diceMax + 1));

// get the index of results to be removed by (dis)advantage
    let rollsToBeDeleted = [];
    if (die.diceAdv > 0)
        rollsToBeDeleted = numRolls.slice().sort((a, b) => a-b).slice(0, die.diceAdv);
    else if (die.diceAdv < 0)
        rollsToBeDeleted = numRolls.slice().sort((a, b) => b-a).slice(0, Math.abs(die.diceAdv));
    let deleteIndex = {};
    for (let i = 0; i < rollsToBeDeleted.length; i++) {
        if (rollsToBeDeleted[i] !== rollsToBeDeleted[i-1]) {
            deleteIndex[rollsToBeDeleted[i]] = 1;
        }
        else 
            deleteIndex[rollsToBeDeleted[i]]++;
    }

    rollsToBeDeleted = [];
    for (roll in deleteIndex) {
        for (let i = 0; i < numRolls.length && deleteIndex[roll] > 0; i++) {
            if (numRolls[i] == roll) {
                deleteIndex[roll]--;
                rollsToBeDeleted.push(i);
            }
        }
    }

// taking care of super explosion
    if (die.superExplode) {
        for (let i = 0, max = numRolls.length; i < max; i++) {
            // if max number reached and not to be deleted by (dis)advantage
            if ((numRolls[i] >= die.diceMax-1) && rollsToBeDeleted.indexOf(i) === -1) {

                // explode in that spot of the array and update rolls to be deleted
                let s = Math.floor(Math.random() * die.diceMax + 1);
                numRolls.splice(i+1, 0, s);
                max++;
                for (let j = 0; j < rollsToBeDeleted.length; j++) {
                    if (rollsToBeDeleted[j] > i)
                        rollsToBeDeleted[j]++;
                }
            }
        }
    }

// taking care of explosion
    else if (die.explode) {
        for (let i = 0, max = numRolls.length; i < max; i++) {
            // if max number reached and not to be deleted by (dis)advantage
            if (numRolls[i] === die.diceMax && rollsToBeDeleted.indexOf(i) === -1) {

                // explode in that spot of the array and update rolls to be deleted
                let s = Math.floor(Math.random() * die.diceMax + 1);
                numRolls.splice(i+1, 0, s);
                max++;
                for (let j = 0; j < rollsToBeDeleted.length; j++) {
                    if (rollsToBeDeleted[j] > i)
                        rollsToBeDeleted[j]++;
                }
            }
        }
    }

// get the string representing the list of results
    let list = "";
    for (let i = 0; i < numRolls.length; i++) {
        // taking care of "," and "e"
        if (i > 0 && i !== numRolls.length-1)
            list += ", ";
        else if (i === numRolls.length-1 && i > 0)
            list += " e ";

        // striking out results removed because of (dis)advantage
        if (rollsToBeDeleted.indexOf(i) !== -1)
            list += "~~";
        // making max rolls bold
        else if (numRolls[i] === die.diceMax || (die.superExplode && numRolls[i] === die.diceMax-1))
            list += "**";

        // putting the result
        list += numRolls[i].toString();

        // striking out results removed because of (dis)advantage
        if (rollsToBeDeleted.indexOf(i) !== -1)
            list += "~~";
        // making max rolls bold (and max-1 too, if superExplosion is happening)
        else if (numRolls[i] === die.diceMax || (die.superExplode && numRolls[i] === die.diceMax-1)) {
            if (die.explode)
                list += "!";
            list += "**";
        }
    }

// removing the dice to be removed by (dis)advantage
    for (let i = numRolls.length; i >= 0; i--) {
        if (rollsToBeDeleted.indexOf(i) !== -1)
            numRolls.splice(i, 1);
    }

// adding the dice results
    let resSum = 0;
    for (i in numRolls)
        resSum += numRolls[i];

// get the string representing the sum of the roll results
    let sum = "";
    for (let i = 0; i < numRolls.length; i++) {

        // taking care of "+" and "="
        if (i > 0)
            sum += " + ";

        // adding the number to the sum, and to the string
        sum += numRolls[i].toString();

        // if reached the end of the results and there was more than one result (or there is a bonus)
        if (i === numRolls.length-1 && (i !== 0 || die.diceBonus !== 0)) {
            // taking care of bonus
            resSum += die.diceBonus;
            if (die.diceBonus > 0)
                sum += " (+" + die.diceBonus + ")";
            if (die.diceBonus < 0)
                sum += " (" + die.diceBonus + ")";

            // taking care of the "=" and the final sum
            sum += " = " + resSum;
        }
    }

// set up return variable
    return {
        list : list,
        sum : sum,
        resultSum : resSum
    }
}
exports.rollDie = rollDie

/**
 * @description gets the roll commands in args
 * 
 * @param {string} args     The string representing the command & arguments
 * 
 * @returns {Roll[]}        The array of dice roll commands
 */
exports.getDiceRoll = function(args) {
    let rolls = [];
    let index = 0;
    while (true) {
        let die = getNextDie(args, index);
        
        // if there is no other dice roll
        if (die === false) {
            break;
        }
        // if there still are dice rolls
        else {
            rolls.push(die.roll);
            index = die.next;
        }
    }

    return rolls;
}

/**
 * @description return the next dice roll and the index of the next word in _args, or return false if no dice roll
 * 
 * @param {string} _args     The string representing the command & arguments 
 * @param {Number} index    The 0-starting index from wich to stat looking, in args, for a valid roll command
 * 
 * @returns {{next:Number, roll: Roll}|Boolean}  Either the roll command and the index of the word immediatelly next to it, or false, if no valid roll was found in the array
 */
const getNextDie = function(_args, index) {

    // create a string with the section of _args with wich we are working
    let args = _args.toLowerCase();
    if (index > 0)
        args = args.slice(index);
    let next = 0;
    
    // if there isn't a valid command roll in args, return false
    if (!/[0-9]* *d *[0-9]+ *!*/i.test(args))
        return false;

    // get current roll command
    let rollStr = /[0-9]* *d *[0-9]+ *!*[d]?/i.exec(args)[0].toString().toLowerCase();
    // check if there are future rolls after this one. if there are, cut the string to not grab advantage/bonus from future rolls
    let postRollArg = args.slice(args.search(rollStr) + rollStr.length);
    // update next to be at the start of the next roll
    next = index + args.search(rollStr) + rollStr.length -1;

    if (/[0-9]* *d *[0-9]+/i.test(postRollArg)) {
        // get everything possible in between the current roll and the start of the next one
        postRollArg = postRollArg.slice(0, /[0-9]* *d *[0-9]+/i.exec(postRollArg).index);
        // and now slice args no not contain anything past the end of postRollArg, and update next;
        args = args.slice(0, args.indexOf(postRollArg) + postRollArg.length);
    }

    // if args doesnt contain the rollStr, add rollStr.length to next;
    if (!/[0-9]* *d *[0-9]+ *!*/i.test(_args.slice(index)))
        next +=rollStr.length;

    // get the dice args
    let roll = {};
    roll.diceQnt = Number(rollStr.slice(0, rollStr.indexOf("d")).trim());
    if (roll.diceQnt == 0)
        roll.diceQnt = 1;

    if (/!/.test(rollStr)) {
        roll.diceMax = Number(rollStr.slice(rollStr.indexOf("d")+1, rollStr.indexOf("!")).trim());
    } else {
        roll.diceMax = Number(rollStr.slice(rollStr.indexOf("d")+1).trim());
    }

    // get explosion
    roll.explode = /!/.test(rollStr);

    // prevent d0's
    if (roll.diceMax <= 0)
        roll.diceMax = 1;

    // prevent d1's with explosion
    if (roll.diceMax === 1)
        roll.explode = false;

    // prevent d2's with super explosion
    if (roll.diceMax >= 2)
        roll.superExplode = false;
    
    // // get bonus
    if (/(\++|-+) *[0-9]+/i.test(postRollArg)) {
        // get the string with the bonus' information
        let bonusStr = /(\++|-+) *[0-9]+/i.exec(postRollArg)[0];
        // update next to be after the bonus
        advIndex = args.indexOf(bonusStr) + bonusStr.length;

        // if a positive bonus
        if (/\+/.test(bonusStr)) {
            roll.diceBonus = Number(bonusStr.slice(bonusStr.lastIndexOf('+')+1).trim());
        }
        // if a negative bonus
        else if (/-/.test(bonusStr)) {
            roll.diceBonus = -1 * Number(bonusStr.slice(bonusStr.lastIndexOf('-')+1).trim());
        } 
        // shouldn't ever come here, but just in case
        else {
            roll.diceBonus = 0;
        }
    }
    // if no bonus
    else {
        roll.diceBonus = 0;
    }
    
    // get advantage
    roll.diceAdv = getAdvantage(postRollArg);

    roll.superExplode = getSuperExplosion(postRollArg);

    // set up return value
    let retVal = {};
    retVal.roll = roll;
    retVal.next = next;

    return retVal;
}

/**
 * @description checks if the roll is suposed to super explode
 * 
 * @param {string} args    The string representing the command & arguments
 * 
 * @returns {Boolean}      If true, it super explodes. if false, no.
 */
const getSuperExplosion = function(args) {
    return /super!/i.test(args)
}

/**
 * @description return the advantage in _args. Negative for disadvantage
 * 
 * @param {string} args    The string representing the command & arguments
 * 
 * @returns {Number}        The advantage on the roll, and how many characters after index the advantage part of the string ends.
 */
const getAdvantage = function(args) {
    // set up return variables
    let advantage = 0;

    // gambiarra pra que a RegExp funcione. preguiça de achar outro modo
    args = " " + args;

    // Now that we know that we arent stepping into other rolls' territory, ...
    // ... we can look for (dis)advantage & bonus
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

    // if there is advantage
    if (advRegExp.test(args)) {

        // get the string that has the advantage
        let advStr = advRegExp.exec(args)[0];
        // now get the advantage number and signal(if they exist)
        if (/(\+|-)? *[0-9]+/.test(advStr)) {

            advantage = Number(/[0-9]+/.exec(advStr)[0]);
            if (/- *[0-9]+/.test(advStr))   // if there is a "-", have negative advantage (disadvantage)
                advantage *= -1;

        // if no advantage number inseted, consider 1 as default
        } else {
            advantage = 1;
        }
    }
    // if there is disadvantage
    else if (disRegExp.test(args)) {
        // get the string that has the disadvantage
        let disStr = disRegExp.exec(args)[0];

        // now get the disadvantage number and signal(if they exist)
        if (/(\+|-)? *[0-9]+/.test(disStr)) {
            advantage = -1 * Number(/[0-9]+/.exec(disStr)[0]);

        // if no disadvantage number inseted, consider -1 as default
        } else {
            advantage = -1;
        }
    }
    // if there is no (dis)advantage
    else {
        advantage = 0;
    }

    return advantage
}

/**
 * @description returns the word lists used for advantage and disadvantage
 * 
 * @returns {{adv: string[], dis: string[]}}
 * 
*/
exports.getAdvWords = function() {
    return {
        adv: advantageWords,
        dis: disadvantageWords
    };
}


/**
 * @description checks if cmdStr is a valid command, and executes it if yes.
 * 
 * @param {string} cmdStr 
 * 
 * @return {{msg: string, attach: {}}|boolean} 
 */
exports.checkCommand = (cmdStr) => {
    let retVal = {
        msg: "",
        attach: {}
    }
    if (cmdStr.length <= 0 || cmdStr[0] !== '!')
        return false

    cmdShrt = cmdStr.split(' ')[0].trim()

    if (isInArray(cmdShrt, rollCmdWords))
        retVal.msg = exports.rollDice(exports.getDiceRoll(cmdStr.slice(cmdShrt.length).trim()), true, true, false)
    else if (isInArray(cmdShrt, sumWords))
        retVal.msg = exports.rollDice(exports.getDiceRoll(cmdStr.slice(cmdShrt.length).trim()), true, true, true)

    if (retVal.msg !== "")
        return retVal
    
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
    let regExp = new RegExp(str.trim(), "i");
    for (s of arr)
        if (regExp.test(s))
            return s

    return false
}