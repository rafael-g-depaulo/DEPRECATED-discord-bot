/**
 * @author Rafael 'Ragan' Gonçalves
 * @fileOverview Manages dicerolls. that's pretty much it
 */

/**** requires ******************************************************************/
const fileIO = require('../fileIO.js')
/**** requires ******************************************************************/

/**** constants *****************************************************************/
// array of words that represent advantage / disadvantage
const {
  advantageWords,
  disadvantageWords
} = JSON.parse(fileIO.read('dice/constants/advDisWords.json'))
// } = require('./advDisWords')
const sumWords          = require('./sumWords')         // array of words that represent the sum roll command
/**** constants *****************************************************************/ 

/**** commands ******************************************************************/
const commands = [
  // require('./commands/diceRoll/diceRoll.js').command,
  // require('./commands/diceSum/diceSum.js').command
]
/**** commands ******************************************************************/


/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ **/
/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ **/
/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ **/
/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ **/
/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ **/
/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ **/
/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ **/


/**
* 
* @param {str} cmd the string constaining the advantage and bonus string representation
* 
* @returns {{adv: number, bonus: number, offset: number}} the advantage and bonus, and the index of the next character after them on the command
*/
const getAdvBonus = function (cmd) {
// try to get advantage
const initCmdLength     = cmd.length
const advDisWords       = exports.getAdvWords()
const advantageWords    = advDisWords.adv
const disadvantageWords = advDisWords.dis

// make a regex of possible words for advantage
let advRegexStr = "(";
for (i in advantageWords) {
  if (i != 0) advRegexStr += "|";
  advRegexStr += advantageWords[i];
}
advRegexStr += ')'

// make a regex of possible words for disadvantage
let disRegexStr = "(";
for (i in disadvantageWords) {
  if (i != 0) disRegexStr += "|";
  disRegexStr += disadvantageWords[i];
}
disRegexStr += ')'

// create the regex's
const advRegexNoNum = new RegExp(`${advRegexStr}`                      , 'i')
const disRegexNoNum = new RegExp(`${disRegexStr}`                      , 'i')
const advRegexNum   = new RegExp(`${advRegexStr} *(\\++|-+)? *([0-9]+)`, 'i')
const disRegexNum   = new RegExp(`${disRegexStr} *(\\++|-+)? *([0-9]+)`, 'i')

// get the advantage, if supplied. 0 as default
let adv = 0;

// if there is negative advantage (with dis number entered)
if (disRegexNum.test(cmd)) {
  let regexResult = disRegexNum.exec(cmd)
  adv = -Number(regexResult[3])
  cmd = cmd.slice(regexResult.index + regexResult[0].length);
}
// if there is positive advantage (with adv number entered)
else if (advRegexNum.test(cmd)) {
  let regexResult = advRegexNum.exec(cmd)
  adv = regexResult[2] === '-' ? -Number(regexResult[3]) : Number(regexResult[3])
  cmd = cmd.slice(regexResult.index + regexResult[0].length)
}
// if there is negative advantage (without adv number entered -> adv = -1)
else if (disRegexNoNum.test(cmd)) {
  cmd = cmd.slice(disRegexNoNum.exec(cmd).index + disRegexNoNum.exec(cmd)[0].length)
  adv = -1
}
// if there is positive advantage (without adv number entered -> adv = 1)
else if (advRegexNoNum.test(cmd)) {
  cmd = cmd.slice(advRegexNoNum.exec(cmd).index + advRegexNoNum.exec(cmd)[0].length)
  adv = 1
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
  bonus: bonus,
  offset: initCmdLength - cmd.length
}
}

// /**
//  * @description return the advantage in _args. Negative for disadvantage
//  * 
//  * @param {string} args    The string representing the command & arguments
//  * 
//  * @returns {Number}        The advantage on the roll, and how many characters after index the advantage part of the string ends.
//  */
// const getAdvantage = function(args) {
//     // set up return variables
//     let advantage = 0;

//     // gambiarra pra que a RegExp funcione. preguiça de achar outro modo
//     args = " " + args;

//     // Now that we know that we arent stepping into other rolls' territory, ...
//     // ... we can look for (dis)advantage & bonus
//     let advRegStr = "(";
//     for (i in advantageWords) {
//         if (i != 0)
//             advRegStr += "|";
//         advRegStr += advantageWords[i];
//     }
//     advRegStr += ") *(\\++|-+)? *[0-9]*";
//     let advRegExp = new RegExp(advRegStr, "i");

//     let disRegStr = "(";
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
//         // now get the advantage number and signal(if they exist)
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

//         // now get the disadvantage number and signal(if they exist)
//         if (/(\+|-)? *[0-9]+/.test(disStr)) {
//             advantage = -1 * Number(/[0-9]+/.exec(disStr)[0]);

//         // if no disadvantage number inseted, consider -1 as default
//         } else {
//             advantage = -1;
//         }
//     }
//     // if there is no (dis)advantage
//     else {
//         advantage = 0;
//     }

//     return advantage
// }

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

  cmdShrt = cmdStr.split(' ')[0].trim().replace('!','')

  if (exports.isDiceSumCmd(cmdStr) || exports.isDiceRollCmd(cmdStr))
      retVal.msg = exports.rollDice(exports.getDiceRoll(cmdStr), true, true, exports.isDiceSumCmd(cmdStr))
  else
      return false;

  if (retVal.msg !== "")
      return retVal
  
  return false
}

// #######################################################################################################################################
// ########## TYPE DEFINITIONS ###########################################################################################################
// #######################################################################################################################################

/**
 * @typedef Roll
 * 
 * @property {Number} diceQnt       The quantity of that die to be rolled
 * @property {Number} diceMax       The maximum roll the die may reach
 * @property {Number} diceAdv       The ammount of advantage/disadvantage the roll has
 * @property {Number} diceBonus     The bonus to be added to the roll
 * @property {Boolean} explode      Whether the dice should explode or not
 * @property {Boolean} superExplode Whether the dice should explode on the maximum, or the maximum AND the maximum-1
 */

/**
 * @typedef RollResults
 * 
 * @property {string} list      The string representing the list of dice roll results
 * @property {string} sum       The string representing the sum of dice roll results
 * @property {number} resultSum The sum of all of the dice rolls
 */
