const fileIO = require('../../../fileIO.js')
const createCommand = require('../../../createCommand.js')
exports.command = createCommand('diceRoll', isDiceRollCmd, (arg, opt) => rollDice(getDiceRoll(arg), opt))
const options = fileIO.read('diceRoll-default-options.json')
rollDice(getDiceRoll(cmdStr), true, true, false)
/**
* @description check if a command is a valid dice roll
* 
* @param {string} args The string representing the command & arguments 
* 
* @returns {Boolean} Wether the args represent at least one dice roll command
*/
const isDiceRollCmd = exports.isDiceRollCmd = (args) => {
  // if there is a valid roll command, return true
  let regExpStr = "("
  for (i in rollCmdWords) {
    if (i != 0) regExpStr += "|"
    regExpStr += rollCmdWords[i]
  }
  regExpStr += ")"
  let regExp = new RegExp(regExpStr, "i")
  if (regExp.test(args)) return true

  // if the user entered a valid dice roll without a command -> return true, else -> false
  return /[0-9]* *d *[0-9]+/i.test(args)
}

/**
* @description rolls the dice in the dice param and returns the appropriate string
* 
* @param {Roll[]} diceArgs Array of dice to be rolled
* @param {{list: boolean, sum: boolean, sumRes: boolean}} opt options for the command
* @param {()=>number} rand an optional pseudo-random function to use instead of Math.random()
* 
* @returns {string}
*/
const rollDice = exports.rollDice = (diceArgs, opt) => {
  // get options
  const {list, sum, sumRes} = opt || {
    list: true,     // Wether or not the results should be listed
    sum: true,      // Wether or not the results of a single roll should be summed
    sumRes: false   // Wether or not the total dice roll results should be summed
  }

  // if dice isn't an array, a mistake has been made
  if (diceArgs.constructor !== Array)
    return "Error: programmer fucked up!\n";
      
  // set up return variable
  let str = ""
  let rollSum = 0
  let rollSumStr = ""

  // if no dice are given, use default
  if (diceArgs.length === 0) {
    const die = {
      diceAdv   : 0,
      diceBonus : 0,
      diceQnt   : 1,
      diceMax   : 20,
      explode   : false
    }
    diceArgs.push(die)
  }

// set up return string
  for (let i = 0; i < diceArgs.length; i++) {
  // roll the dice and get the results
    let rollResult = rollDie(diceArgs[i], rand)

  // if more then one roll, numer the rolls
    if (diceArgs.length !== 1)
      str += (i+1).toString() + ") "

  // add roll arguments
    str += "__**" + diceArgs[i].diceQnt + "d" + diceArgs[i].diceMax
    if (diceArgs[i].explode)
      str += "!"
    if (diceArgs[i].diceBonus > 0)
      str += " +" + diceArgs[i].diceBonus
    else if (diceArgs[i].diceBonus < 0)
      str += " " + diceArgs[i].diceBonus
    if (diceArgs[i].diceAdv > 0)
      str += " adv+" + diceArgs[i].diceAdv
    if (diceArgs[i].diceAdv < 0)
      str += " dis" + diceArgs[i].diceAdv
    
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
      rollSum += Number(rollResult.resultSum)
      rollSumStr += "" + rollResult.resultSum
    
    // taking care of "+" and "="
      if (i < diceArgs.length-1)
        rollSumStr += " + "
      else
        rollSumStr += " = **" + rollSum + "**"
    }
  }

// add the roll sum to return string, if suposed to
  if (sumRes && diceArgs.length > 1)
    str += "\n\n\t**Soma:** " + rollSumStr + ";\n";

// return the result
  return str;
}

/**
* @description gets the roll commands in args
* 
* @param {string} args     The string representing the command & arguments
* 
* @returns {Roll[]}        The array of dice roll commands
*/
const getDiceRoll = exports.getDiceRoll = (args) => {
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
const getNextDie = (_args, index) => {

  // create a string with the section of _args with wich we are working
  let args = _args.toLowerCase();
  if (index > 0)
      args = args.slice(index);
  let next = 0;
  
  // if there isn't a valid command roll in args, return false
  if (!/[0-9]* *d *[0-9]+ *!*/i.test(args))
      return false;

  // get current roll command
  // this used to have a '[d]?' at the end of the regex, no idea why. kept here in comment form in case i regret changing it
  let rollStr = /[0-9]* *d *[0-9]+ *!*/i.exec(args)[0].toString().toLowerCase();
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
  // // this might be ByteLengthQueuingStrategy. (one was in each branch and i don't know which is correct)
  // // update next to be at the start of the next roll
  // next = index + rollStr.length + /[0-9]* *d *[0-9]+ *!*/i.exec(args).index;

  // if args doesnt contain the rollStr, add rollStr.length to next;
  if (!/[0-9]* *d *[0-9]+ *!*/i.test(_args.slice(index)))
      next += rollStr.length;

  // get the dice quantity
  let roll = {};
  roll.diceQnt = Number(rollStr.slice(0, rollStr.indexOf("d")).trim());
  if (roll.diceQnt == 0)
      roll.diceQnt = 1;

  // get the dice maximum
  roll.diceMax = Number(
    rollStr
      .slice(
        rollStr.indexOf('d')+1,
        /!/.test(rollStr) ? rollStr.indexOf('!') : rollStr.length
      )
      .trim()
    )

  // get explosion and super explosion
  roll.explode = /!/.test(rollStr);
  roll.superExplode = /!!/.test(rollStr);

  // prevent d0's
  if (roll.diceMax <= 0)
      roll.diceMax = 1;

  // prevent d1's with explosion
  if (roll.diceMax === 1)
      roll.explode = false;

  // prevent d2's and d1's with super explosion
  if (roll.diceMax <= 2)
      roll.superExplode = false;

  // get adv
  const advBonus = getAdvBonus(postRollArg)
  roll.diceBonus = advBonus.bonus
  roll.diceAdv   = advBonus.adv
  next += advBonus.offset

  // set up return value
  let retVal = {};
  retVal.roll = roll;
  retVal.next = next;

  return retVal;
}

/**
* @description rolls the dice in param and returns apropriate string
* 
* @param {Roll} die The dice to be rolled
* @param {()=>number} rand an optional pseudo-random function to use instead of Math.random()
* 
* @returns {RollResults}
*/
const rollDie = exports._rollDie = (die, rand) => {
  // create the dice randomness function
  rand = rand || Math.random  // if no randomness function supplied, use M<ath.random

  const getDieRoll = (diceMax) => {
    let rNum = rand()
    if (isNaN(rNum)) throw 'Error in dice.js rollDie function. randomness function supplied, but returned NaN'
    if (rNum == 1) return diceMax
    else return Math.floor((rNum % 1) * diceMax + 1)
  }

// roll the dice
  let numRolls = [];
  for (let i = 0; i < die.diceQnt + Math.abs(die.diceAdv); i++)
      numRolls.push(getDieRoll(die.diceMax));

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
              let s = getDieRoll(die.diceMax);
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
              let s = getDieRoll(die.diceMax);
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
/** "exports._rollDie" SHOULD NOT BE USED, IT IS HERE ONLY IN ORDER TO DO UNIT TESTS DURING DEVELOPMENT */

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

