/**
 * @description creates commands to be run
 * 
 * @param {string} name name of the command
 * @param {(str: string, options: Object) => boolean} isCmd function that checks wether or not a string is that command
 * @param {(str: string, options: Object) => cmdReturn} cmd function to be executed if a string matches the command
 * 
 * @returns {Cmd} a regularized command
 */
exports.createCommand = (name, isCmd, cmd) => ({
  name: name,
  isCmd: (str, options) => isCmd(str, options),
  cmd:   (str, options) => cmd(str, options)
})

// fileIO = require('./fileIO.js')

exports.getCommand = (moduleName, commandName) => {
  return require(`/${moduleName}/commands/${commandName}/${commandName}.js`)
}

console.log('exports.getCommand(dice, diceRoll)', exports.getCommand('dice', 'diceRoll'))

/**
 * @typedef CmdReturn
 * 
 * @property {string} msg the message to be sent to the player
 * @property {string} attach url to the file to be sent as an attachment to the message. empty if no file to be sent
 */

 /**
  * @typedef Cmd
  * 
  * @property {string} name the name of the command
  * @property {(str: string, opt) => boolean} isCmd function that checks wether or not a string is that command 
  * @property {(str: string, opt) => cmdReturn} cmd function to be executed if a string matches the command 
  */