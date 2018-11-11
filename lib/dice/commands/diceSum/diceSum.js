const diceRoll = require('./diceRoll.js')

/**
* @description check if a command is a valid dice roll
* 
* @param {string} args The string representing the command & arguments 
* 
* @returns {Boolean} Wether the args represent at least one dice roll command
*/
const isDiceSumCmd = (args) => {

  // if there is a valid roll command, return true
  let regExpStr = "(";
  for (i in sumWords) {
      if (i != 0)
          regExpStr += "|";
          regExpStr += sumWords[i];
  }
  regExpStr += ")";
  let regExp = new RegExp(regExpStr, "i");

  return regExp.test(args)
}