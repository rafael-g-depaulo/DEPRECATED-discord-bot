// Loading modules ////////////////////////////////////////////////
const Discord = require('discord.js')
const fs      = require('fs')
const path    = require('path')
const Dice    = require('./lib/dice.js')
const fileIO  = require('./lib/fileIO.js')
const FB      = require('./lib/fantasyBattle.js')

const bot = new Discord.Client()

// Array of user info ////////////////////////////////////////////
let users = [];

// setting up bot constants //////////////////////////////////////
  // wether the bot lists and/or sums the dice rolls
  const list = true;
  const sum = true;

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
  if (!users.hasOwnProperty(id)) {
    // se a pessoa não tem um arquivo
    if (!fileIO.existsSync(`../users/${message.author.id}.json`)) {
      fileIO.writeSync(`../users/${message.author.id}.json`, '{}')
    }
    
    // get the users data from file
    users[id.toString()] = JSON.parse(fileIO.read(`../users/${message.author.id}.json`));

  }
  
// test if command from a module
  // resultado do comando
  let commandResult = false;
  // checa se é um commando do/conversa com Fantasy Battle
  if (!commandResult) commandResult = FB.checkCommand(cmd, users[id])
  // checa se é um commando de rolagem de dado
  if (!commandResult) commandResult = Dice.checkCommand(cmd)
  // se não, checa se é um commando do próximo modulo
  /********************* INSERT NEXT MODULE HERE ***********************/

// if it wasn't a command specific of a module, test if regular command
  if (!commandResult) commandResult = (() => {
    if (cmd[0] === "!" && /help/i.test(cmd.split(' ')[0])) {
      let msg = ""

      msg += "Os comandos que existem são (colchetes -> opcional):\n\n"
      msg += "\t\"!createChar\"\n\t\t-> Para criar um novo personagem"                                                              + "\n\n"
      msg += "\t\"!changeChar [nome do personagem]\"\n\t\t-> Para mudar o personagem ativo"                                         + "\n\n"
      msg += "\t\"!(atributo) [(des)vantagem+x] [bonus]\"\n\t\t-> Para fazer uma rolagem de atributo"                               + "\n\n"
      msg += "\t\"!iniciativa [(des)vantagem+x] [bonus]\"\n\t\t-> Para rolar iniciativa"                                            + "\n\n"
      msg += "\t\"!dano (atributo) [(dis)advantage+x] [bonus]\"\n\t\t-> Para rolar dano"                                            + "\n\n"
      msg += "\t\"!attack [attributo] [(dis)advantage+x] [bonus]\"\n\t\t-> Para rolar um ataque"                                    + "\n\n"
      msg += "\t\"!damageCalc (GUARD) (DODGE) (danoTomado)\"\n\t\t-> Para calcular dano"                                            + "\n\n"
      msg += "\t\"!damageCalc (danoTomado)\"\n\t\t-> Para calcular dano (usa o Guard e Dodge do seu personagem ativo)"              + "\n\n"
      msg += "\t\"!draw\"\n\t\t-> Para comprar uma carta"                                                                           + "\n\n"
      msg += "\t\"!card [nome da carta]\"\n\t\t-> Para usar uma carta"                                                              + "\n\n"
      msg += "\t\"!HP/MP/Stamina (+/-)x\"\n\t\t-> Para aumentar/diminuir seu HP/MP/Stamina atual"                                   + "\n\n"
      msg += "\t\"!bonus (Atributo) (+/-)x\"\n\t\t-> Para aumentar/diminuir seu bonus em um attributo"                              + "\n\n"
      msg += "\t\"!bonus (GUARD/DODGE) (+/-)x\"\n\t\t-> Para aumentar/diminuir seu bonus em Guard ou Dodge"                         + "\n\n"
      msg += "\t\"!setMax HP/MP/Stamina x\"\n\t\t-> Para mudar seu HP/MP/Stamina máximo"                                            + "\n\n"
      msg += "\t\"!set (Atributo) x\"\n\t\t-> Para mudar o valor base de um atributo"                                               + "\n\n"
      msg += "\t\"!set Guard/Dodge (x|auto)\"\n\t\t-> Para mudar o seu valor base em Guard ou Dodge. \"auto\" usa a formula padrão" + "\n\n"
      msg += `\t\"!set size x\"\n\t\t-> Para mudar o tamanho do seu personagem`                                                     + "\n\n"
      msg += "\t\"!bio\"\n\t\t-> Para checar HP/MP/Atributos/etc. do seu personagem ativo"                                          + "\n\n"
      msg += "\t\"!shortRest\"\n\t\t-> realiza um descanço curto"                                                                   + "\n\n"
      msg += "\t\"!longRest\"\n\t\t-> realiza um descanço longo"                                                                    + "\n\n"
      msg += `\t"!magicPerception"\n\t\t-> faz uma rolagem de percepção mágica (depende de percepção e presciencia)`                + "\n\n"
      msg += `\t"!reflexos"\n\t\t-> faz uma rolagem de reflexos (depende de agilidade e percepção)`                                 + "\n\n"

      return {
        msg,
        attach: {}
      }
    } else {
      return false
    }
  })()

// if there is something to send, send it
  if (commandResult) {
      if (id in users && users[id] != '{}')
        fileIO.write(`../users/${message.author,id}.json`, JSON.stringify(users[id]));
      
      // if a conversation, send directly to user
      if (commandResult.sendDirect)
          if (Object.keys(commandResult.attach).length !== 0)
              message.author.send(commandResult.msg, commandResult.attach);
          else
              message.author.send(commandResult.msg);
      // if command, send to channel
      else
          if (Object.keys(commandResult.attach).length !== 0)
              message.channel.send(commandResult.msg, commandResult.attach);
          else
              message.channel.send(commandResult.msg);

      return

  }
  // // guardar as informações no arquivo do usuário
  // fileIO.write('users/'+message.author.id+'.json', JSON.stringify(users[id]));
})

bot.login(fileIO.read('../botKey'))
