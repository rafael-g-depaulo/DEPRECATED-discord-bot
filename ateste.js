// /**
//  * @author Rafael 'Ragan' Gonçalves
//  * @fileOverview Manages dicerolls. that's pretty much it
//  */

// /**
//  * @typedef {Object} Roll
//  * 
//  * @property {Number} diceQnt   The quantity of that die to be rolled
//  * @property {Number} diceMax   The maximum roll the die may reach
//  * @property {Number} diceAdv   The ammount of advantage/disadvantage the roll has
//  * @property {Number} diceBonus The bonus to be added to the roll
//  * @property {Boolean} explode  Whether the dice should explode or not
//  */


// /**** constants *****************************************************************/ 

// // array of words that represent the roll command
// const rollCmdWords = [
//     "roll",
//     "rola",
//     "rol",
//     "role"
// ];

// // array of words that represent advantage
// const advantageWords = [
//     "advantage",
//     "advantadge",
//     "vantagem",
//     "adv",
//     "vant"
// ];

// // array of words that represent disadvantage
// const disadvantageWords = [
//     "disadvantage",
//     "disadvantadge",
//     "dis",
//     "disv",
//     "disvant",
//     "dvan",
//     "dvant",
//     "disvantagem",
//     "desvantagem",
//     "desv",
//     "des",
// ]
// /**** constants *****************************************************************/ 

// /**
//  * @description check if a command is a valid dice roll
//  * 
//  * @param {string} args The string representing the command & arguments 
//  * 
//  * @returns {Boolean} Wether the args represent at least one dice roll command
//  */
// exports.isDiceRollCmd = function(args) {

//     // if there is a valid roll command at the start, return true
//     let regExp = "/(";
//     for (i in rollCmdWords) {
//         if (i != 0)
//             regExp += "|";
//         regExp += rollCmdWords[i];
//     }
//     regExp += ")/i";
//     if (regExp.test(args))
//         return true;

//     // check if the user entered a valid dice roll without a command, (yes=>return true,no=>return false)
//     if (/[0-9]* *d * [0-9]+/i.test(args))
//         return true;
//     else
//         return false;
// }

// /**
//  * @description gets the roll commands in args
//  * 
//  * @param {string} args     The string representing the command & arguments
//  * 
//  * @returns {Roll[]}        The array of dice roll commands
//  */
// exports.getDiceRoll = function(args) {
//     let rolls = [];
//     let index = 0;

//     while (true) {
//         let die = getNextDie(args, index);

//         // if there is no other dice roll
//         if (die === false) {
//             break;
//         }
//         // if there still are dice rolls
//         else {
//             rolls.push(die.roll);
//             index = die.next;
//         }
//     }

//     return rolls;
// }

// /**
//  * @description return the next dice roll and the index of the next word in _args, or return false if no dice roll
//  * 
//  * @param {string} args     The string representing the command & arguments 
//  * @param {Number} index    The 0-starting index from wich to stat looking, in args, for a valid roll command
//  * 
//  * @returns {{next:Number, roll: Roll}|Boolean}  Either the roll command and the index of the word immediatelly next to it, or false, if no valid roll was found in the array
//  */
// const getNextDie = function(args, index) {

//     // if there isn't a valid command roll in args, return false
//     if (!/[0-9]* *d *[0-9]+/i.test(args.slice(index)))
//         return false;

//     // get next roll command
//     let rollStr = /[0-9]* *d *[0-9]+ *!*/i.exec(args.slice(index))[0].toString().toLowerCase();

//     // set up the index from where to start looking for advantage
//     let advIndex = args.indexOf(rollStr) + rollStr.length;

//     // get the dice args
//     let roll = {};
//     roll.diceQnt = Number(rollStr.slice(0, rollStr.indexOf("d")).trim());
//     if (/!/.test(rollStr)) {
//         roll.diceMax = Number(rollStr.slice(rollStr.indexOf("d")+1, rollStr.indexOf("!")).trim());
//     } else {
//         roll.diceMax = Number(rollStr.slice(rollStr.indexOf("d")+1).trim());
//     }

//     // get explosion
//     roll.explode = /!/.test(rollStr);
    
//     // get bonus
//     if (/[0-9]* *d *[0-9]+ *!* *(\++|-+) *[0-9]+/i.test(args.slice(index))) {
//         // get the string with the bonus' information
//         let bonusStr = /(\++|-+) *[0-9]+/i.exec(args.slice(index))[0];

//         // update next to be after the bonus
//         advIndex = args.slice(index).indexOf(bonusStr) + bonusStr.length;

//         // if a positive bonus
//         if (/\+/.test(bonusStr)) {
//             roll.diceBonus = Number(bonusStr.slice(bonusStr.lastIndexOf('+')+1).trim());
//         }
//         // if a negative bonus
//         else if (/-/.test(bonusStr)) {
//             roll.diceBonus = -1 * Number(bonusStr.slice(bonusStr.lastIndexOf('-')+1).trim());
//         } 
//         // shouldn't ever come here, but just in case
//         else {
//             roll.diceBonus = 0;
//         }
//     }
//     // if no bonus
//     else {
//         roll.diceBonus = 0;
//     }
    

//     // get advantage
//     let advRes = getAdvantage(args, advIndex);

//     // index from wich next roll should be searched for
//     let next = advIndex;

//     if (advRes === false)
//         roll.diceAdv = 0;
//     else {
//         next += advRes.next;
//         roll.diceAdv = advRes.adv;
//     }

//     // set up return value
//     let retVal = {};
//     retVal.roll = roll;
//     retVal.next = next;

//     return retVal;
// }

// /**
//  * @description return the advantage in _args. Negative for disadvantage
//  * 
//  * @param {string} _args    The string representing the command & arguments 
//  * @param {Number} index    The 0-starting index from wich to stat looking, in _args, for a valid (dis)advantage argument
//  * 
//  * @returns {{adv: Number; next: Number}|Boolean}        The advantage on the roll, and how many characters after index the advantage part of the string ends.
//  */
// const getAdvantage = function(_args, index) {
//     // set up return variables
//     let advantage = 0;
//     let next = 0;

//     // Check if there is another roll command later on, and if there is make sure ...
//     // ... to not cross it when looking for (dis)advantage
//     let args = _args.slice(index);

//     // gambiarra pra que a RegExp funcione. preguiça de achar outro modo
//     args = " " + args;

//     // cut up args to not get advantage for future rolls confused with advantage for current roll
//     let max = args.search(/[0-9]* *d *[0-9]+/);
//     if (max !== -1) {
//         args = args.slice(0, max);
//     }

//     // Now that we know that we arent stepping into other rolls' territory, ...
//     // ... we can look for (dis)advantage & bonus
//     let advRegStr = "[0-9]* +(";
//     for (i in advantageWords) {
//         if (i != 0)
//             advRegStr += "|";
//         advRegStr += advantageWords[i];
//     }
//     advRegStr += ") *(\\++|-+)? *[0-9]*";
//     let advRegExp = new RegExp(advRegStr, "i");

//     let disRegStr = "[0-9]* +(";
//     for (i in disadvantageWords) {
//         if (i != 0)
//             disRegStr += "|";
//             disRegStr += disadvantageWords[i];
//     }
//     disRegStr += ") *(\\++|-+)? *[0-9]*";
//     let disRegExp = new RegExp(disRegStr, "i");

//     // if there is advantage
//     if (advRegExp.test(args)) {

//         // get the string that has the advantage
//         let advStr = advRegExp.exec(args)[0];

//         // update next
//         next = advStr.length;

//         // now get the advantage number and signal(if they exist)
//         //  OBS: if multiple numbers, first one is chosen
//         if (/(\+|-)? *[0-9]+/.test(advStr)) {

//             advantage = Number(/[0-9]+/.exec(advStr)[0]);
//             if (/- *[0-9]+/.test(advStr))   // if there is a "-", have negative advantage (disadvantage)
//                 advantage *= -1;

//         // if no advantage number inseted, consider 1 as default
//         } else {
//             advantage = 1;
//         }
//     }
//     // if there is disadvantage
//     else if (disRegExp.test(args)) {
//         // get the string that has the disadvantage
//         let disStr = disRegExp.exec(args)[0];

//         // update next
//         next = disStr.length;

//         // now get the disadvantage number and signal(if they exist)
//         //  OBS: if multiple numbers, first one is chosen
//         if (/(\+|-)? *[0-9]+/.test(disStr)) {
//             advantage = -1 * Number(/[0-9]+/.exec(disStr)[0]);

//         // if no disadvantage number inseted, consider -1 as default
//         } else {
//             advantage = -1;
//         }
//     }
//     // if there is no (dis)advantage
//     else {
//         return false;
//     }

//     let retVal = {};
//     retVal.adv = advantage;
//     retVal.next = next;
//     return retVal;
// }


const Dice = require('./dice.js');

let str = "testeeeee 2d34! +6 adv  -2  asdasdasdasd d28 adv3  teste aaaaa 2d4! -2 adv+3 aaaa 1d2 adv 4";
let rolls = Dice.getDiceRoll(str);
let index = 2;
let resStr = Dice.rollDice(rolls, true, true);
// console.log(str);

console.log(rolls[index]);
console.log(resStr);