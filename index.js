// Loading modules ////////////////////////////////////////////////
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const Dice = require('./dice.js');
const fileIO = require('./fileIO.js');
const FB = require("./fantasyBattle.js")
const bot = new Discord.Client();

// Array of user info ////////////////////////////////////////////
let users = [];

// setting up bot constants //////////////////////////////////////
    // wether the bot lists and/or sums the dice rolls
    const list = true;
    const sum = true;

    // wether the bot accepts straight attribute roll commands (e.g.: "!Agility" for "!rola Agility")
    const dirAttr = true;

bot.on('ready', () => {
    console.log("ready!");
});

// on message to bot
bot.on('message', (message) => {

    // if empty message, return
    if (message.content.length === 0) return;
    // stop bot from talking to itself
    if (message.author.bot) return;
    // if message comes from invalid chat room, return
    if (message.channel.name === "general" || message.channel.name === "links-e-afim") return;

    // set up important variables
    let id = message.author.id;         // user id
    const cmd = message.content         // user message
    
    // se a info do usuário não está carregada, carregue-a em memória
    if (!(id in users)) {
        // se a pessoa não tem um arquivo
        if (!fs.existsSync('users/'+message.author.id+'.json'))
            fileIO.writeSync('users/'+message.author.id+'.json', '{}');

        // get the users data from file
        users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
    }

    // pegando o personagem ativo
    let actChar = undefined;
    if (users[id].hasOwnProperty("activeCharId"))
        actChar = users[id].chars[users[id].activeCharId];

// test if command from a module
    // resultado do comando
    let commandResult;
    // checa se é um commando do/conversa com Fantasy Battle
    commandResult = FB.checkCommand(cmd, users[id])
    // checa se é um commando de rolagem de dado
    commandResult = Dice.checkCommand(cmd)
    // se não, checa se é um commando do próximo modulo
    /********************* INSERT NEXT MODULE HERE ***********************/

// if it wasn't a command specific of a module, test if regular command

// if there is something to send, send it
    if (commandResult) {
        fileIO.write('users/'+message.author.id+'.json', JSON.stringify(users[id]));

        console.log("commandResult: ")
        console.log(commandResult)
 
        if (Object.keys(commandResult.attach).length !== 0)
            message.channel.send(commandResult.msg, commandResult.attach);
        else
            message.channel.send(commandResult.msg);
        return;
    }
    // guardar as informações no arquivo do usuário
    fileIO.write('users/'+message.author.id+'.json', JSON.stringify(users[id]));
})

/**
 * @description checks if cmdStr is a valid command, and executes it if yes.
 * 
 * @param {string} cmdStr 
 * @param {User}   user
 * 
 * @return {{msg: string, attach: {}}|boolean} 
 */
const checkCommand = (cmdStr, user) => {
    return false;
}

/**
 * @description checks if a user has a specific character
 * 
 * @param {{chars: {name: string}[]}} user 
 * @param {string} char 
 * 
 * @returns {boolean}
 */
const hasChar = function(user, char) {
    char = char.toLowerCase().trim();
    for (let i = 0; i < user.chars.length; i++)
        if (user.chars[i].name.toLowerCase().trim().search(char) !== -1)
            return true;
    return false;
}

/**
 * @description returns a specific character the user has
 * 
 * @param {{chars: {name: string}[]}} user 
 * @param {string} char 
 * 
 * @returns {any} the character
 */
const getChar = function(user, char) {
    char = char.toLowerCase().trim();
    for (let i = 0; i < user.chars.length; i++)
        if (user.chars[i].name.toLowerCase().trim().search(char) !== -1)
            return user.chars[i];
}

bot.login('NDAxNTM3MTYzMTEzNjYwNDM2.DUFImw.DhpAJ_Qd2hoIe14WdAK0KAd3qhI');