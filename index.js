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

    // wether the bot accepts commands on general chat
    const genCmds = false;

// on message to bot
bot.on('message', (message) => {

    // if from general chat, ignore
    if (!genCmds && message.channel.name === "general")
        return;
    
    let id = message.author.id;              // user id
    let actChar;                             // users active character
    if ((id in users) && users[id].activeCharId) {
        actChar = users[id].chars[users[id].activeCharId];
    }

    // checando se foi um comando
    if (message.content.slice(0, 1) === '!') {
        const cmd = message.content.slice(1);    // shorthand for the entered command
        let str = "";                            // response string

        switch (cmd.split(" ")[0].toLowerCase()) {
            case 'help':
                str += "Bem vindo ao Slave-Bot 1.2. Os comandos disponíveis são: \n\n";
                str += "\t!roll : rola um ou mais dados, no formato [num]d[num]. Dados \
                também podem ter (des)vantagem, bonus positivos ou negativos, e explosão;\n";
                str += "\t!sum : rola um ou mais dados, como !roll, e soma os resultados;";
                break;

            case 'sum':
            case 'soma':
            case 'some':
            case 'summ':
                let rollArgs = Dice.getDiceRoll(cmd);
                let rollResult = Dice.rollDice(rollArgs, list, sum, true);
    
                str += rollResult;
                break;

            case 'createchar':
                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }
                
                // if already creating a character
                if (users[id].isCreatingChar) {
                    message.author.send("Você já está no meio da criação de um personagem. Quer descartar esse personagem incompleto e criar outro?");
                    users[id].resetCharCreationConfirm = true;
                    break;
                }

                // start character creation process
                users[id].isCreatingChar = true;

                // if there is no chars array, create one
                if (!users[id].hasOwnProperty("chars") || users[id].chars.constructor !== Array)
                users[id].chars = [];
                
                // add new chracter
                users[id].chars.push({"id": users[id].chars.length, "step": "confirming"});
                message.author.send('Você tem certeza que quer criar um personagem novo?');

                fileIO.write('users/'+message.author.id+'.json', JSON.stringify(users[id]));
                break;
            
            case 'changeactivechar':
                
                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }

                // se a pessoa não tem personagens
                if (!users[id].hasOwnProperty("chars") || users[id].chars.constructor !== Array
                    || users[id].chars.length === 0 || users[id].chars[0].step !== "complete") {
                        message.author.send("Você nem personagens prontos tem e quer mudar qual deles tá ativo? Vá criar um personagem antes");
                        break;
                    }

                // se um nome foi recebido, checar se o personagem existe. se sim, setar ele como ativo
                let name = cmd.trim()
                              .slice('changeactivechar'.length)
                              .toLowerCase()
                              .trim();
                
                // se um nome foi inserido
                if (name !== "") {
                    let foundChars = users[id].chars.reduce((prev, ele, i, chars) => {
                        if (ele.name.toLowerCase().search(name) !== -1) {
                            prev.push(ele);
                        }
                        return prev;
                    }, []);

                    // if one char found
                    if (foundChars.length === 1) {
                        actChar = users[id].chars[users[id].activeCharId];  // currently active char
                        // se o personagem achado é o personagem ativo atualmente
                        if (foundChars[0].id === users[id].activeCharId) {
                            message.author.send(actChar.name+" já é o personagem ativo.");
                        } else {
                            users[id].isConfirmingNewActiveChar = true;
                            users[id].possibleNewActiveCharID = foundChars[0].id;
                            message.author.send("Quer mudar seu personagem ativo de "+ actChar.name +" para "+ foundChars[0].name
                            +"? Por favor digite sim para confirmar, ou qualquer outra coisa para reverter a mudança");
                        }
                    }
                    // if more than one chars found
                    else if (foundChars.length > 1) {
                        let msg = "Multiplos personagens com nomes compatíveis achados. Os personagens achados com nomes compatíveis são: \n";
                        for (let i = 0; i < foundChars.length; i++) {
                            msg += "\t\t" + i+1 + ") " + foundChars[i].name;
                            if (i == foundChars.length-1 && users[id].hasOwnProperty("isCreatingChar"))
                                msg += "(em progresso)";
                        }
                        msg += "\nQual o número do personagem que você quer deixar ativo?";
                        message.author.send(msg);
                        users[id].isChosingActiveChar = true;
                    }
                    // if no chars found
                    else {
                        message.author.send("Você não tem nenhum personagem com esse nome.");
                    }

                // se não
                } else {
                    let foundChars = users[id].chars.reduce((prev, ele, i, chars) => {
                        if (ele.name.toLowerCase().search(name) !== -1) {
                            prev.push(ele);
                        }
                        return prev;
                    }, []);
                    let msg = "Os personagens que você tem são: \n\n";
                    for (let i = 0; i < foundChars.length; i++) {
                        msg += "\t\t" + (1+i) + ") " + foundChars[i].name
                        msg += "\n";
                    }
                    msg += "\nQual o número do personagem que você quer deixar ativo?"
                    message.author.send(msg);
                    users[id].isChosingActiveChar = true;
                }
                
                fileIO.write('users/'+message.author.id+'.json', JSON.stringify(users[id]));
                break;
            
            case 'activechar':
                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }

                // se o usuário não tem personagem ativo
                if (!users[id].hasOwnProperty("activeCharId"))
                    message.author.send("Você não tem um personagem ativo. Crie um com !createChar");

                // se o usuario tem personagem ativo
                else {
                    
                    let msg = "";
                    let actChar;
                    actChar = users[id].chars[users[id].activeCharId];  // active character
                    FB.getMaxHP(actChar);

                    switch (actChar.system) {
                        case "Open Legend - Fantasy Battle":
                            msg += "Seu personagem ativo é "+ actChar.name + ". Seus stats são:\n\n"

                            + "**Hit Points(HP)**:\t\t\t" + actChar.HP        + " / "
                                + actChar.maxHP + "\n"
                            + "**Mana Points(MP)**:\t\t" + actChar.MP        + " / "
                                + actChar.maxMP + "\n\n"

                            + "\t**Physical**:\n"
                                +  "\t\tAgility: "    + actChar.Agility     + "\n"
                                +  "\t\tFortitude: "  + actChar.Fortitude   + "\n"
                                +  "\t\tMight: "      + actChar.Might       + "\n\n"
                                
                            + "\t**Mental**:\n"
                                +  "\t\tLearning: "   + actChar.Learning    + "\n"
                                +  "\t\tLogic: "      + actChar.Logic       + "\n"
                                +  "\t\tPerception: " + actChar.Perception  + "\n"
                                +  "\t\tWill: "       + actChar.Will        + "\n\n"
                                
                            + "\t**Social**:\n"
                                +  "\t\tDeception: "  + actChar.Deception   + "\n"
                                +  "\t\tPersuasion: " + actChar.Persuasion  + "\n"
                                +  "\t\tPresence: "   + actChar.Presence    + "\n\n"
                                
                            + "\t**Supernatural**:\n"
                                +  "\t\tAlteration: " + actChar.Alteration  + "\n"
                                +  "\t\tCreation: "   + actChar.Creation    + "\n"
                                +  "\t\tEnergy: "     + actChar.Energy      + "\n"
                                +  "\t\tEntropy: "    + actChar.Entropy     + "\n"
                                +  "\t\tInfluence: "  + actChar.Influence   + "\n"
                                +  "\t\tMovement: "   + actChar.Movement    + "\n"
                                +  "\t\tPrescience: " + actChar.Prescience  + "\n"
                                +  "\t\tProtection: " + actChar.Protection;

                            message.author.send(msg);
                            break;
                    }
                }
                break;

            case 'role':
            case 'rola':
            case 'roll':
            case 'checa':
                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }
    
                // se a pessoa não tem um personagem ativo, tratar como uma rolagem normal
                if (!users[id].hasOwnProperty("activeCharId")) {
                    let rollArgs = Dice.getDiceRoll(cmd);
                    let rollResult = Dice.rollDice(rollArgs, list, sum, false);

                    str += rollResult;
                    break;
                }
                // se a pessoa tem um personagem ativo, procurar um attributo para rolar
                else {
                    let actChar;
                    actChar = users[id].chars[users[id].activeCharId];      // active character
                    // lidar com o personagem ativo de acordo com o sistema que ele usa
                    switch (actChar.system) {
                        // se o personagem é de Open Legend - Fantasy Battle
                        case "Open Legend - Fantasy Battle":
                            // se o usuário não entrou nenhum argumento, tratar como uma rolagem normal
                            if (cmd.split(" ").length < 2) {
                                let rollArgs = Dice.getDiceRoll(cmd);
                                let rollResult = Dice.rollDice(rollArgs, list, sum, false);
                                str += rollResult;
                                break;
                            }
                            // se o usuário entrou algum argumento
                            else {
                                let bonus = 0;

                                // if the user entered a valid attribute, roll 1d20 + 2*that attribute [+ bonus]
                                FB.useAttribute(cmd.split(" ")[1].toLowerCase(), (Attribute) => {
                                    // if there is a bonus, add it
                                    if (/[0-9]+/.test(cmd)) {
                                        // if the bonus is positive
                                        if (/\+ *[0-9]+/.test(cmd))
                                            bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                        // if the bonus is negative
                                        if (/\- *[0-9]+/.test(cmd))
                                            bonus = -1 * Number(/[0-9]+/.exec(cmd)[0])
                                    }

                                    str += FB.rollAttribute(actChar[Attribute] + bonus);

                                }, (invAttribute) => {
                                    // if they are rolling for initiative.
                                    if (invAttribute === "initiative" ||
                                        invAttribute === "iniciativa") {

                                        // if there is a bonus, add it
                                        if (/[0-9]+/.test(cmd)) {
                                            // if the bonus is positive
                                            if (/\+ *[0-9]+/.test(cmd))
                                                bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                            // if the bonus is negative
                                            if (/\- *[0-9]+/.test(cmd))
                                                bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                        }

                                        str += FB.rollInitiative(actChar.Agility + bonus);
                                    }

                                    // if they arent rolling for initiative, test if making a straight roll
                                    else {
                                        if (Dice.isDiceRollCmd(cmd)) {
                                            let rollArgs = Dice.getDiceRoll(cmd);
                                            let rollResult = Dice.rollDice(rollArgs, list, sum, false);
                                            str += rollResult;
                                        } else {
                                            str += invAttribute + " não é um atributo válido. Aprenda a escrever.";
                                        }
                                    }
                                });
                            }
                            break;

                        default:
                            break;
                    }
                }
                break;

            case 'dano':
            case 'damage':
            case 'dmg':
                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }

                // se o usuário não tem um pesonagem ativo, sair.
                if (!users[id].hasOwnProperty("activeCharId")) {
                    message.author.send("Você não pode rolar dano sem ter um personagem cadastrado e ativo. Use !createChar para criar um personagem.");
                    break;
                }

                

                // lidar com o personagem ativo de acordo com o sistema que ele usa
                let actChar = users[id].chars[users[id].activeCharId];
                switch (actChar.system) {
                    case "Open Legend - Fantasy Battle":
                        // se o usuário não entrou nenhum argumento, usar o attributo padrão do personagem
                        if (cmd.split(" ").length == 1) {
                            str += FB.rollDamage(actChar[actChar.attackAttribute]);
                            break;
                        }

                        // se o usuário entrou algum argumento
                        else {
                            let bonus = 0;
                            FB.useAttribute(cmd.split(" ")[1].toLowerCase(),
                            // se foi um attributo válido
                            (Attribute) => {
                                // if there is a bonus, add it
                                if (/[0-9]+/.test(cmd)) {
                                    // if the bonus is positive
                                    if (/\+ *[0-9]+/.test(cmd))
                                        bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                    // if the bonus is negative
                                    if (/\- *[0-9]+/.test(cmd))
                                        bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                }
                                str += FB.rollDamage(actChar[Attribute] + bonus);
                            },
                            // se não foi um attributo válido
                            (invAttribute) => {
                                // if the invalid attribute was a bonus for the default attack attribute (!dmg +bonus)
                                if (/(\+|-) *[0-9]+/.test(cmd)) {

                                    // if the bonus is positive
                                    if (/\+ *[0-9]+/.test(cmd))
                                        bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                    // if the bonus is negative
                                    if (/\- *[0-9]+/.test(cmd))
                                        bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);

                                    str += FB.rollDamage(actChar[actChar.attackAttribute] + bonus);
                                }
                                // se não é, comando invalido
                                else
                                    str += invAttribute + " não é um atributo válido. Aprenda a escrever.";
                            });
                        }
                        break;
                    default:
                        break;
                }
                break;

            case "initiative":
            case "iniciativa":

                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }

                if (!users[id].hasOwnProperty("activeCharId"))
                    break;
                if (true) {
                    let actChar = users[id].chars[users[id].activeCharId];
                    str += FB.rollInitiative(actChar.Agility);
                }
                break;

            case "mana":
            case "manapoints":
            case "mp":
            case "hp":
            case "health":
            case "vida":
            case "saude":
            case "saúde":
            case "healthpoints":
            case "hitpoints":
                
                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }

                // se o usuário não tem um personagem carregado, sair
                if (!users[id].hasOwnProperty("activeCharId"))
                    break;
                

                // if user entered a bonus, add it
                let bonus = 0;
                if (/[0-9]+/.test(cmd)) {
                    // get active char
                    let actChar = users[id].chars[users[id].activeCharId];

                    // let resource = false;
                    // if it is a positive bonus
                    if (/\+ *[0-9]+/.test(cmd))
                        bonus = Number(/[0-9]+/.exec(cmd)[0]);
                    // if it is a negative bonus
                    else if (/- *[0-9]+/.test(cmd))
                        bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);
                    // if it is a static number
                    // else
                    //     resource = Number(/[0-9]+/.exec(cmd)[0]);

                    // add bonus to correspondant resource
                    if (cmd.split(" ")[0].toLowerCase() === "mana" ||
                        cmd.split(" ")[0].toLowerCase() === "manapoints" ||
                        cmd.split(" ")[0].toLowerCase() === "mp") {
                            // if static value
                            // if (!resource) {
                            //     actChar.MP = resource;
                            //     if (actChar.MP > actChar.maxMP)
                            //         actChar.MP = actChar.maxMP;
                            // }
                            // if bonus
                            // else {
                                actChar.MP += bonus;
                                if (actChar.MP > actChar.maxMP)
                                    actChar.MP = actChar.maxMP;
                            // }
                    }
                    else if (cmd.split(" ")[0].toLowerCase() === "hp" ||
                             cmd.split(" ")[0].toLowerCase() === "health" ||
                             cmd.split(" ")[0].toLowerCase() === "healthpoints" ||
                             cmd.split(" ")[0].toLowerCase() === "hitpoints" ||
                             cmd.split(" ")[0].toLowerCase() === "vida" ||
                             cmd.split(" ")[0].toLowerCase() === "saúde" ||
                             cmd.split(" ")[0].toLowerCase() === "saude") {
                                // get active char
                                let actChar = users[id].chars[users[id].activeCharId];
                                // if static value
                                // if (!resource) {
                                //     actChar.HP = resource;
                                //     if (actChar.HP > actChar.maxHP)
                                //         actChar.HP = actChar.maxHP;
                                // }
                                // if bonus
                                // else {
                                    actChar.HP += bonus;
                                    if (actChar.HP > actChar.maxHP)
                                        actChar.HP = actChar.maxHP;
                                // }
                    }    
                }

                // show character's correspondent resource
                // if mana
                if (cmd.split(" ")[0].toLowerCase() === "mana" ||
                    cmd.split(" ")[0].toLowerCase() === "manapoints" ||
                    cmd.split(" ")[0].toLowerCase() === "mp") {
                        // get active char
                        let actChar = users[id].chars[users[id].activeCharId];
                        str += "**" + actChar.name + "**:\n"
                        +  "\tMP:\t" + actChar.MP + " / " + actChar.maxMP;
                }
                // if hp
                else if (cmd.split(" ")[0].toLowerCase() === "hp" ||
                         cmd.split(" ")[0].toLowerCase() === "health" ||
                         cmd.split(" ")[0].toLowerCase() === "healthpoints" ||
                         cmd.split(" ")[0].toLowerCase() === "hitpoints" ||
                         cmd.split(" ")[0].toLowerCase() === "vida" ||
                         cmd.split(" ")[0].toLowerCase() === "saúde" ||
                         cmd.split(" ")[0].toLowerCase() === "saude") {
                            // get active char
                            let actChar = users[id].chars[users[id].activeCharId];
                            str += "**" + actChar.name + "**:\n"
                            +  "\tHP:\t" + actChar.HP + " / " + actChar.maxHP;
                }
                break;
            
            case "override":
                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }

                // if not in form "!override resource/Attribute number/bonus" or "!override char resource/Attribute number/bonus", break
                if ((cmd.split(" ").length < 4 || !/[0-9]/.test(cmd.split(" ")[3])) &&
                    (cmd.split(" ").length < 3 || !/[0-9]/.test(cmd.split(" ")[2]))) {
                    str += "Comando inválido. Se certifique que está usando a forma \"!override (nome do personagem) (recurso/atributo) (novo valor/bonus a ser adicionado)\"";
                    break;
                }
                let char = cmd.split(" ")[1].toLowerCase();
                let charId = -1;

                // check if char is in user's char list
                for (let i = 0; i < users[id].chars.length; i++) {
                    if (users[id].chars[i].name.toLowerCase().search(char) !== -1) {
                        charId = i;
                        break;
                    }
                }

                // if no character found, use active character
                if (charId === -1) {
                    let actChar = users[id].chars[users[id].activeCharId];    // active character

                    // treat character accordinly to their system
                    switch (actChar.system) {
                        case "Open Legend - Fantasy Battle":
                            // test if in form "!override resource/Attribute number/bonus". if not, break
                            if (cmd.split(" ").length >= 3 && /[0-9]/.test(cmd.split(" ")[2])) {
                                // check what should be changed, and change it
                                FB.useAttribute(cmd.split(" ")[1].toLowerCase(),
                                    // if changing attribute
                                    (Attribute) => {
                                        // if it was a positive bonus
                                        if (/\+ *[0-9]+/.test(cmd.split(" ")[2]))
                                            actChar[Attribute] += Number(/[0-9]+/.exec(cmd)[0]);
                                        // if it was a negative bonus
                                        if (/- *[0-9]+/.test(cmd.split(" ")[2]))
                                            actChar[Attribute] += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                        // if it was a static value
                                        else
                                            actChar[Attribute] = Number(/[0-9]+/.exec(cmd)[0]);
                                    },
                                    // if not attribute, check if it was a resource
                                    (invAttribute) => {
                                        // check if it was a valid resource
                                        switch (invAttribute) {
                                            case "mana":
                                            case "maxmana":
                                            case "manapoints":
                                            case "mp":
                                            case "maxmp":
                                                // if it was a positive bonus
                                                if (/\+ *[0-9]+/.test(cmd.split(" ")[2])) {
                                                    actChar.maxMP += Number(/[0-9]+/.exec(cmd)[0]);
                                                    actChar.MP    += Number(/[0-9]+/.exec(cmd)[0]);
                                                }
                                                // if it was a negative bonus
                                                if (/- *[0-9]+/.test(cmd.split(" ")[2])) {
                                                    actChar.maxMP += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                                    actChar.MP    += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                                }
                                                // if it was a static value
                                                else {
                                                    actChar.maxMP += Number(/[0-9]+/.exec(cmd)[0]);
                                                    actChar.MP    += Number(/[0-9]+/.exec(cmd)[0]);
                                                }
                                                break;
        
                                            case "health":
                                            case "hp":
                                            case "healthpoints":
                                            case "hitpoints":
                                                // if it was a positive bonus
                                                if (/\+ *[0-9]+/.test(cmd.split(" ")[2])) {
                                                    actChar.maxHP += Number(/[0-9]+/.exec(cmd)[0]);
                                                    actChar.HP    += Number(/[0-9]+/.exec(cmd)[0]);
                                                }
                                                // if it was a negative bonus
                                                if (/- *[0-9]+/.test(cmd.split(" ")[2])) {
                                                    actChar.maxHP += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                                    actChar.HP    += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                                }
                                                // if it was a static value
                                                else {
                                                    actChar.maxHP = Number(/[0-9]+/.exec(cmd)[0]);
                                                    actChar.HP    = Number(/[0-9]+/.exec(cmd)[0]);
                                                }
                                                break;
                                        }
                                    }
                                );
                            }
                            // if not in valid form
                            else {
                                str += "Personagem inválido/inexistente. Tente de novo.";
                            }
                            break;
                    }
                    break;
                }

                // if character found
                else {
                    // test if in form "!override character resource/Attribute number/bonus". if not, break
                    if (cmd.split(" ").length >= 4 && /[0-9]/.test(cmd)) {
                        // check what should be changed, and change it
                        FB.useAttribute(cmd.split(" ")[2].toLowerCase(),
                            // if changing attribute
                            (Attribute) => {
                                // if it was a positive bonus
                                if (/\+ *[0-9]+/.test(cmd)) {
                                    users[id].chars[charId][Attribute] += Number(/[0-9]+/.exec(cmd)[0]);
                                    users[id].chars[charId][Attribute] += Number(/[0-9]+/.exec(cmd)[0]);
                                }
                                // if it was a negative bonus
                                if (/- *[0-9]+/.test(cmd)) {
                                    users[id].chars[charId][Attribute] += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                    users[id].chars[charId][Attribute] += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                }
                                // if it was a static value
                                else {
                                    users[id].chars[charId][Attribute] = Number(/[0-9]+/.exec(cmd)[0]);
                                    users[id].chars[charId][Attribute] = Number(/[0-9]+/.exec(cmd)[0]);
                                }
                            },
                            // if not attribute, check if it was a resource
                            (invAttribute) => {
                                // check if it was a valid resource
                                switch (invAttribute) {
                                    case "mana":
                                    case "maxmana":
                                    case "manapoints":
                                    case "mp":
                                    case "maxmp":
                                        // if it was a positive bonus
                                        if (/\+ *[0-9]+/.test(cmd)) {
                                            users[id].chars[charId].maxMP += Number(/[0-9]+/.exec(cmd)[0]);
                                            users[id].chars[charId].MP    += Number(/[0-9]+/.exec(cmd)[0]);
                                        }
                                        // if it was a negative bonus
                                        if (/- *[0-9]+/.test(cmd)) {
                                            users[id].chars[charId].maxMP += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                            users[id].chars[charId].MP    += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                        }
                                        // if it was a static value
                                        else {
                                            users[id].chars[charId].maxMP = Number(/[0-9]+/.exec(cmd)[0]);
                                            users[id].chars[charId].MP    = Number(/[0-9]+/.exec(cmd)[0]);
                                        }
                                        break;

                                    case "health":
                                    case "hp":
                                    case "healthpoints":
                                    case "hitpoints":
                                        // if it was a positive bonus
                                        if (/\+ *[0-9]+/.test(cmd)) {
                                            users[id].chars[charId].maxHP += Number(/[0-9]+/.exec(cmd)[0]);
                                            users[id].chars[charId].HP    += Number(/[0-9]+/.exec(cmd)[0]);
                                        }
                                        // if it was a negative bonus
                                        if (/- *[0-9]+/.test(cmd)) {
                                            users[id].chars[charId].maxHP += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                            users[id].chars[charId].HP    += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                        }
                                        // if it was a static value
                                        else {
                                            users[id].chars[charId].maxHP = Number(/[0-9]+/.exec(cmd)[0]);
                                            users[id].chars[charId].HP    = Number(/[0-9]+/.exec(cmd)[0]);
                                        }
                                        break;

                                    default:
                                        str += "Atributo/recurso inválido ou nexistente. Tente de novo, mas se esforce dessa vez";
                                        break;
                                }
                            }
                        );
                    }
                    // if not in form "!override character resource/Attribute number/bonus"
                    break;
                }

                // treat character accordingly to their system 
                switch(users[id].chars[charId].system) {
                    case "Open Legend - Fantasy Battle":

                        // if a valid character was entered, check what should be changed, and change it
                        FB.useAttribute(cmd.split(" ")[2].toLowerCase(),
                            // if changing attribute
                            (Attribute) => {
                                // if it was a bonus
                                if (/(\+|-) *[0-9]+/.test(cmd.split(" ")[3]))
                                    users[id].chars['charId'][Attribute] += Number(cmd.split(" ")[3]);
                                // if it was a static value
                                else
                                    users[id].chars[charId][Attribute] = Number(cmd.split(" ")[3]);
                            },
                            // if not attribute, check if it was a resource
                            (invAttribute) => {
                                // check if it was a valid resource
                                switch (cmd.split(" ")[2].toLowerCase()) {
                                    case "mana":
                                    case "maxmana":
                                    case "manapoints":
                                    case "mp":
                                    case "maxmp":
                                        // if it was a bonus
                                        if (/(\+|-) *[0-9]+/.test(cmd.split(" ")[3])) {
                                            users[id].chars[charId].maxMP += Number(cmd.split(" ")[3]);
                                            users[id].chars[charId].MP    += Number(cmd.split(" ")[3]);
                                        }
                                        // if it was a static value
                                        else {
                                            users[id].chars[charId].maxMP = Number(cmd.split(" ")[3]);
                                            users[id].chars[charId].MP    = Number(cmd.split(" ")[3]);
                                        }
                                        break;

                                    case "health":
                                    case "hp":
                                    case "healthpoints":
                                    case "hitpoints":
                                        // if it was a bonus
                                        if (/(\+|-) *[0-9]+/.test(cmd.split(" ")[3])) {
                                            users[id].chars[charId].maxHP += Number(cmd.split(" ")[3]);
                                            users[id].chars[charId].HP    += Number(cmd.split(" ")[3]);
                                        }
                                        // if it was a static value
                                        else {
                                            users[id].chars[charId].maxHP = Number(cmd.split(" ")[3]);
                                            users[id].chars[charId].HP    = Number(cmd.split(" ")[3]);
                                        }
                                        break;

                                    case "stamina":
                                    case "stam":
                                        // if it was a bonus
                                        if (/(\+|-) *[0-9]+/.test(cmd.split(" ")[3])) {
                                            users[id].chars[charId].maxStamina += Number(cmd.split(" ")[3]);
                                            users[id].chars[charId].Stamina    += Number(cmd.split(" ")[3]);
                                        }
                                        // if it was a static value
                                        else {
                                            users[id].chars[charId].maxStamina = Number(cmd.split(" ")[3]);
                                            users[id].chars[charId].Stamina    = Number(cmd.split(" ")[3]);
                                        }
                                        break;
                                        break;
                                }
                            }
                        );
                        break;
                }
                break;

            default:
                // se a info do usuário não está carregada, carregue-a em memória
                if (!(id in users)) {
                    // se a pessoa não tem um arquivo
                    if (!fs.existsSync('users/'+message.author.id+'.json'))
                        fileIO.writeSync('users/'+message.author.id+'.json', '{}');

                    // get the users data from file
                    users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
                }

                // se não tem personagens, break
                if (!users[id].hasOwnProperty("activeCharId"))
                    break;

                // se está mexendo com um personagem diretamente
                let curChar = false;
                for (let i = 0; i < users[id].chars.length; i++)
                    if (users[id].chars[i].name.toLowerCase().search(cmd.split(" ")[0].toLowerCase()) !== -1 && users[id].chars[i].step === "complete")
                        curChar = i;

                if (curChar !== false && cmd.split(" ").length > 1) {
                    let currentChar = users[id].chars[curChar];
                    switch (cmd.split(" ")[1].toLowerCase()) {
                        case "initiative":
                        case "iniciativa":        
                            str += FB.rollInitiative(currentChar.Agility);
                            break;

                        case 'dano':
                        case 'damage':
                        case 'dmg':
                            // lidar com o personagem ativo de acordo com o sistema que ele usa
                            switch (currentChar.system) {
                                case "Open Legend - Fantasy Battle":
                                    // se o usuário não entrou nenhum argumento, usar o attributo padrão do personagem
                                    if (cmd.split(" ").length == 2) {
                                        str += FB.rollDamage(currentChar[currentChar.attackAttribute]);
                                        break;
                                    }
            
                                    // se o usuário entrou algum argumento
                                    else {
                                        let bonus = 0;
                                        FB.useAttribute(cmd.split(" ")[2].toLowerCase(),
                                        // se foi um attributo válido
                                        (Attribute) => {
                                            // if there is a bonus, add it
                                            if (/[0-9]+/.test(cmd)) {
                                                // if the bonus is positive
                                                if (/\+ *[0-9]+/.test(cmd))
                                                    bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                                // if the bonus is negative
                                                if (/\- *[0-9]+/.test(cmd))
                                                    bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                            }
                                            str += FB.rollDamage(currentChar[Attribute] + bonus);
                                        },
                                        // se não foi um attributo válido
                                        (invAttribute) => {
                                            // if the invalid attribute was a bonus for the default attack attribute (!dmg +bonus)
                                            if (/(\+|-) *[0-9]+/.test(cmd)) {
            
                                                // if the bonus is positive
                                                if (/\+ *[0-9]+/.test(cmd))
                                                    bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                                // if the bonus is negative
                                                if (/\- *[0-9]+/.test(cmd))
                                                    bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);
            
                                                str += FB.rollDamage(currentChar[currentChar.attackAttribute] + bonus);
                                            }
                                            // se não é, comando invalido
                                            else
                                                str += invAttribute + " não é um atributo válido. Aprenda a escrever.";
                                        });
                                    }
                                    break;
                                default:
                                    break;
                            }
                            break;
                            
                        case 'role':
                        case 'rola':
                        case 'checa':
                            // lidar com o personagem ativo de acordo com o sistema que ele usa
                            switch (currentChar.system) {
                                // se o personagem é de Open Legend - Fantasy Battle
                                case "Open Legend - Fantasy Battle":
                                    // se o usuário não entrou nenhum argumento, tratar como uma rolagem normal
                                    if (cmd.split(" ").length < 3) {
                                        let rollArgs = Dice.getDiceRoll(cmd);
                                        let rollResult = Dice.rollDice(rollArgs, list, sum, false);
                                        str += rollResult;
                                        break;
                                    }
                                    // se o usuário entrou algum argumento
                                    else {
                                        let bonus = 0;
        
                                        // if the user entered a valid attribute, roll 1d20 + 2*that attribute [+ bonus]
                                        FB.useAttribute(cmd.split(" ")[2].toLowerCase(), (Attribute) => {
                                            // if there is a bonus, add it
                                            if (/[0-9]+/.test(cmd)) {
                                                // if the bonus is positive
                                                if (/\+ *[0-9]+/.test(cmd))
                                                    bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                                // if the bonus is negative
                                                if (/\- *[0-9]+/.test(cmd))
                                                    bonus = -1 * Number(/[0-9]+/.exec(cmd)[0])
                                            }
        
                                            str += FB.rollAttribute(currentChar[Attribute] + bonus);
        
                                        }, (invAttribute) => {
                                            // if they are rolling for initiative.
                                            if (invAttribute === "initiative" ||
                                                invAttribute === "iniciativa") {
        
                                                // if there is a bonus, add it
                                                if (/[0-9]+/.test(cmd)) {
                                                    // if the bonus is positive
                                                    if (/\+ *[0-9]+/.test(cmd))
                                                        bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                                    // if the bonus is negative
                                                    if (/\- *[0-9]+/.test(cmd))
                                                        bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                                }
        
                                                str += FB.rollInitiative(currentChar.Agility + bonus);
                                            }
        
                                            // if they arent rolling for initiative, then they made a mistake
                                            else {
                                                str += invAttribute + " não é um atributo válido. Aprenda a escrever.";
                                            }
                                        });
                                    }
                                    break;
        
                                default:
                                    break;
                                }
                            break;
                                    
                        case "mana":
                        case "manapoints":
                        case "mp":
                        case "hp":
                        case "health":
                        case "vida":
                        case "saude":
                        case "saúde":
                        case "healthpoints":
                        case "hitpoints":

                            // if user entered a bonus, add it
                            let bonus = 0;
                            if (/(\+|-) *[0-9]+/.test(cmd)) {
                                // if it is a positive bonus
                                if (/\+ *[0-9]+/.test(cmd))
                                    bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                // if it is a negative bonus
                                if (/- *[0-9]+/.test(cmd))
                                    bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);

                                // add bonus to correspondant resource
                                if (cmd.split(" ")[1].toLowerCase() === "mana" ||
                                    cmd.split(" ")[1].toLowerCase() === "manapoints" ||
                                    cmd.split(" ")[1].toLowerCase() === "mp") {
                                        currentChar.MP += bonus;
                                        if (currentChar.MP > currentChar.maxMP)
                                            currentChar.MP = currentChar.maxMP;
                                }
                                else if (cmd.split(" ")[1].toLowerCase() === "hp" ||
                                        cmd.split(" ")[1].toLowerCase() === "health" ||
                                        cmd.split(" ")[1].toLowerCase() === "healthpoints" ||
                                        cmd.split(" ")[1].toLowerCase() === "hitpoints" ||
                                        cmd.split(" ")[1].toLowerCase() === "vida" ||
                                        cmd.split(" ")[1].toLowerCase() === "saúde" ||
                                        cmd.split(" ")[1].toLowerCase() === "saude") {
                                            currentChar.HP += bonus;
                                            if (currentChar.HP > currentChar.maxHP)
                                                currentChar.HP = currentChar.maxHP;
                                }    
                            }

                            // show character's correspondent resource
                            // if mana
                            if (cmd.split(" ")[1].toLowerCase() === "mana" ||
                                cmd.split(" ")[1].toLowerCase() === "manapoints" ||
                                cmd.split(" ")[1].toLowerCase() === "mp") {
                                    str += "**" + currentChar.name + "**:\n"
                                    +  "\tMP:\t" + currentChar.MP + " / " + currentChar.maxMP;
                            }
                            // if hp
                            else if (cmd.split(" ")[1].toLowerCase() === "hp" ||
                                    cmd.split(" ")[1].toLowerCase() === "health" ||
                                    cmd.split(" ")[1].toLowerCase() === "healthpoints" ||
                                    cmd.split(" ")[1].toLowerCase() === "hitpoints" ||
                                    cmd.split(" ")[1].toLowerCase() === "vida" ||
                                    cmd.split(" ")[1].toLowerCase() === "saúde" ||
                                    cmd.split(" ")[1].toLowerCase() === "saude") {
                                        str += "**" + currentChar.name + "**:\n"
                                        +  "\tHP:\t" + currentChar.HP + " / " + currentChar.maxHP;
                            }
                            break;
                        
                        case "override":

                            // if not in form "!char override resource/Attribute number/bonus", break
                            if (cmd.split(" ").length < 4 || !/[0-9]/.test(cmd)) {
                                str += "Comando inválido. Se certifique que está usando a forma \"!(nome do personagem) override (recurso/atributo) (novo valor/bonus a ser adicionado)\"";
                                break;
                            }

                            // treat character accordingly to their system 
                            switch(currentChar.system) {
                                case "Open Legend - Fantasy Battle":

                                    // if a valid character was entered, check what should be changed, and change it
                                    FB.useAttribute(cmd.split(" ")[2].toLowerCase(),
                                        // if changing attribute
                                        (Attribute) => {
                                            // if it was a positive bonus
                                            if (/\+ *[0-9]+/.test(cmd.split(" ")[2]))
                                                currentChar[Attribute] += Number(/[0-9]+/.exec(cmd)[0]);
                                            // if it was a negative bonus
                                            if (/- *[0-9]+/.test(cmd.split(" ")[2]))
                                                currentChar[Attribute] += -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                            // if it was a static value
                                            else
                                                currentChar[Attribute] = Number(/[0-9]+/.exec(cmd)[0]);
                                        },
                                        // if not attribute, check if it was a resource
                                        (invAttribute) => {
                                            // check if it was a valid resource
                                            switch (cmd.split(" ")[2].toLowerCase()) {
                                                case "mana":
                                                case "maxmana":
                                                case "manapoints":
                                                case "mp":
                                                case "maxmp":
                                                    // if it was a positive bonus
                                                    if (/\+ *[0-9]+/.test(cmd.split(" ")[2])) {
                                                        currentChar.maxMP += Number(/[0-9]+/.exec(cmd)[0])
                                                        currentChar.MP    += Number(/[0-9]+/.exec(cmd)[0])
                                                    }
                                                    // if it was a negative bonus
                                                    if (/- *[0-9]+/.test(cmd.split(" ")[2])) {
                                                        currentChar.maxMP += -1 * Number(/[0-9]+/.exec(cmd)[0])
                                                        currentChar.MP    += -1 * Number(/[0-9]+/.exec(cmd)[0])
                                                    }
                                                    // if it was a static value
                                                    else {
                                                        currentChar.maxMP = Number(/[0-9]+/.exec(cmd)[0]);
                                                        currentChar.MP = Number(/[0-9]+/.exec(cmd)[0]);
                                                    }
                                                    break;

                                                case "health":
                                                case "hp":
                                                case "healthpoints":
                                                case "hitpoints":
                                                    // if it was a positive bonus
                                                    if (/\+ *[0-9]+/.test(cmd.split(" ")[2])) {
                                                        currentChar.maxHP += Number(/[0-9]+/.exec(cmd)[0])
                                                        currentChar.HP    += Number(/[0-9]+/.exec(cmd)[0])
                                                    }
                                                    // if it was a negative bonus
                                                    if (/- *[0-9]+/.test(cmd.split(" ")[2])) {
                                                        currentChar.maxHP += -1 * Number(/[0-9]+/.exec(cmd)[0])
                                                        currentChar.HP    += -1 * Number(/[0-9]+/.exec(cmd)[0])
                                                    }
                                                    // if it was a static value
                                                    else {
                                                        currentChar.maxHP = Number(/[0-9]+/.exec(cmd)[0]);
                                                        currentChar.HP = Number(/[0-9]+/.exec(cmd)[0]);
                                                    }
                                                    break;
                                            }
                                        }
                                    );
                                    break;
                            }
                            break;

                        default:
                            // se foi uma rolagem de attributo
                            if (currentChar.system === "Open Legend - Fantasy Battle") {
                                let bonus = 0;
                                FB.useAttribute(cmd.split(" ")[1].toLowerCase(),
                                // if if is an attribute roll, roll it.
                                    (Attribute) => {
                                        // if there is a bonus, add it
                                        if (/[0-9]+/.test(cmd)) {
                                            // if the bonus is positive
                                            if (/\+ *[0-9]+/.test(cmd))
                                                bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                            // if the bonus is negative
                                            if (/\- *[0-9]+/.test(cmd))
                                                bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);
                                        }
                                        // roll the attribute
                                        str += FB.rollAttribute(currentChar[Attribute] + bonus);
                                    },
                                // if if isn't
                                    (invAtt) => {
                                        str += "conheço essa merda de comando " + invAtt + " não. Aprende a escrever oh retardado.";
                                    }
                                );
                            }
                            break;
                    }
                }
                // if just "!character", show character's attributes
                    else if (curChar !== false && cmd.split(" ").length === 1) {let msg = "";
                    actChar = users[id].chars[users[id].activeCharId];  // active character
                    FB.getMaxHP(actChar);

                    switch (actChar.system) {
                        case "Open Legend - Fantasy Battle":
                            msg += "Seu personagem ativo é "+ actChar.name + ". Seus stats são:\n\n"

                            + "**Hit Points(HP)**:\t\t\t" + actChar.HP        + " / "
                                + actChar.maxHP + "\n"
                            + "**Mana Points(MP)**:\t\t" + actChar.MP        + " / "
                                + actChar.maxMP + "\n\n"

                            + "\t**Physical**:\n"
                                +  "\t\tAgility: "    + actChar.Agility     + "\n"
                                +  "\t\tFortitude: "  + actChar.Fortitude   + "\n"
                                +  "\t\tMight: "      + actChar.Might       + "\n\n"
                                
                            + "\t**Mental**:\n"
                                +  "\t\tLearning: "   + actChar.Learning    + "\n"
                                +  "\t\tLogic: "      + actChar.Logic       + "\n"
                                +  "\t\tPerception: " + actChar.Perception  + "\n"
                                +  "\t\tWill: "       + actChar.Will        + "\n\n"
                                
                            + "\t**Social**:\n"
                                +  "\t\tDeception: "  + actChar.Deception   + "\n"
                                +  "\t\tPersuasion: " + actChar.Persuasion  + "\n"
                                +  "\t\tPresence: "   + actChar.Presence    + "\n\n"
                                
                            + "\t**Supernatural**:\n"
                                +  "\t\tAlteration: " + actChar.Alteration  + "\n"
                                +  "\t\tCreation: "   + actChar.Creation    + "\n"
                                +  "\t\tEnergy: "     + actChar.Energy      + "\n"
                                +  "\t\tEntropy: "    + actChar.Entropy     + "\n"
                                +  "\t\tInfluence: "  + actChar.Influence   + "\n"
                                +  "\t\tMovement: "   + actChar.Movement    + "\n"
                                +  "\t\tPrescience: " + actChar.Prescience  + "\n"
                                +  "\t\tProtection: " + actChar.Protection;

                            message.author.send(msg);
                            break;
                    }
                }
                
                // se foi uma rolagem de attributo
                if (users[id].hasOwnProperty("activeCharId") && users[id].chars[users[id].activeCharId].system === "Open Legend - Fantasy Battle") {
                    
                    let bonus = 0;
                    let actChar;
                    actChar = users[id].chars[users[id].activeCharId];  // active char
                    FB.useAttribute(cmd.split(" ")[0].toLowerCase(),
                    // if if is an attribute roll, roll it.
                        (Attribute) => {
                            // if there is a bonus, add it
                            if (/[0-9]+/.test(cmd)) {
                                // if the bonus is positive
                                if (/\+ *[0-9]+/.test(cmd))
                                    bonus = Number(/[0-9]+/.exec(cmd)[0]);
                                // if the bonus is negative
                                if (/\- *[0-9]+/.test(cmd))
                                    bonus = -1 * Number(/[0-9]+/.exec(cmd)[0]);
                            }
                            // roll the attribute
                            str += FB.rollAttribute(actChar[Attribute] + bonus);
                        },
                    // if if isn't, do nothing
                        (invAtt) => {}
                    );
                }

                // se foi uma rolagem de dado
                else if (Dice.isDiceRollCmd(cmd)) {
                    let rollArgs = Dice.getDiceRoll(cmd);
                    let rollResult = Dice.rollDice(rollArgs, list, sum, false);
                    str += rollResult;
                } 
                // se não
                else {
                    str += "conheço essa merda de comando " + cmd.split(" ")[0].toLowerCase() + " não. Aprende a escrever oh retardado.";
                }
                break;
        }

        // se é pra mandar alguma coisa
        if (str !== "") {
            message.channel.send(str);
        }
    }

    // se é uma conversa com o bot
    else if (fs.existsSync('users/'+message.author.id+'.json')) {

        // se a info do usuário não está carregada, carregue-a em memória
        if (!(id in users)) {
            // get the users data from file
            users[id] = JSON.parse(fileIO.read('users/'+message.author.id+'.json'));
        }

        // se está no processo de confirmação de parar o processo de criação de um personagem e começar outro
        if (users[id].resetCharCreationConfirm) {
            if (message.content.toLowerCase().trim() === "yes" || message.content.toLowerCase().trim() === "y" ||
                message.content.toLowerCase().trim() === "sim" || message.content.toLowerCase().trim() === "s") {
                
                    // get rid of work-in-progress character
                    users[id].chars.pop();
                    users[id].chars.push({ id: users[id].chars.length, step: "naming"});
                    delete users[id].resetCharCreationConfirm;
                    message.author.send("Ok, e qual é o nome do seu personagem novo?");
                }
            else if  (message.content.toLowerCase().trim() === "no" || message.content.toLowerCase().trim() === "n" ||
            message.content.toLowerCase().trim() === "nao" || message.content.toLowerCase().trim() === "não") {
            
                // get rid of work-in-progress character
                delete users[id].resetCharCreationConfirm;
            } else {
                message.author.send("Eu não entendi, pode responder de novo?");
            }
        }
        // se esta criando personagem
        else if (users[id].isCreatingChar) {

            switch (users[id].chars[users[id].chars.length-1].step) {
                case "confirming":
                    // se concorda em criar personagem
                    if (message.content.toLowerCase().trim() === "yes" || message.content.toLowerCase().trim() === "y" ||
                        message.content.toLowerCase().trim() === "sim" || message.content.toLowerCase().trim() === "s") {
                        
                        users[id].chars[users[id].chars.length-1].step = "naming";
                        message.author.send("Ok! E qual o nome do seu personagem?");
                    }
                    // se não concorda em criar personagem, parar o processo de criar personagem
                    else {
                        users[id].chars.pop();
                        delete users[id].isCreatingChar;
                    }
                    break;

                case "naming":
                    // guardar o nome
                    users[id].chars[users[id].chars.length-1].name = message.content.trim();
                    users[id].chars[users[id].chars.length-1].step = "name confirming";
                    message.author.send("O nome do seu personagem é \"" + message.content + "\"? Digite sim para confirmar, e qualquer"
                    +" outra coisa para escolher outro nome");
                     break;
                
                case "name confirming":
                    if (message.content.toLowerCase().trim() === "yes" || message.content.toLowerCase().trim() === "y" ||
                        message.content.toLowerCase().trim() === "sim" || message.content.toLowerCase().trim() === "s") {
                        users[id].chars[users[id].chars.length-1].step = "system chosing";
                        let msg = "Ok! E qual é o sistema de RPG de "+ users[id].chars[users[id].chars.length-1].name +"?"
                                + " Os sistemas suportados são:\n"
                                + "\t\t1) Open Legend - Fantasy Battle";
                        message.author.send(msg);
                    } else {
                        message.author.send("Qual é o nome do seu personagem então?");
                        users[id].chars[users[id].chars.length-1].step = "naming";
                    }
                    break;

                case "system chosing":
                    // se o sistema indicado for válido
                    switch (message.content.toLowerCase().trim()) {
                        case "1":
                        case "1)":
                        case "open legend - fantasy battle":
                        case "open legend- fantasy battle":
                        case "open legend-fantasy battle":
                        case "open legend -fantasy battle":
                        case "open legend : fantasy battle":
                        case "open legend: fantasy battle":
                        case "fantasy battle":
                        case "open legend":
                            users[id].chars[users[id].chars.length-1].system = "Open Legend - Fantasy Battle";
                            message.author.send("Seu personagem é do sistema \"Open Legend - Fantasy Battle\", então. Qual o level de "+ users[id].chars[users[id].chars.length-1].name +"?");
                            users[id].chars[users[id].chars.length-1].step = "OL: leveling";
                            break;
                        
                        default:
                            message.author.send("Sistema não reconhecido, por favor escolha de novo. (seu idiota)");
                            break;
                    }
                    break;
                
                case "OL: leveling":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Level = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Level = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" é Level "+ users[id].chars[users[id].chars.length-1].Level
                                + ". Agora nós vamos cuidar dos Attributos do seu Personagem. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Agilidade?";
                                users[id].chars[users[id].chars.length-1].step = "OL: stating Agi";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Agilidade "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;

                case "OL: stating Agi":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Agility = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Agility = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Agility
                                + " de Agilidade. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Fortitude?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating For";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Agilidade "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating For":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Fortitude = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Fortitude = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Fortitude
                                + " de Fortitude. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Might/Força?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Mig";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Fortitude "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;

                case "OL: stating Mig":
                     // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Might = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Might = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Might
                                + " de Might. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Learning/Aprendizado?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Lea";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Might "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Lea":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Learning = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Learning = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Learning
                                + " de Learning. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Logic/Lógica?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Log";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Learning "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Log":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Logic = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Logic = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Logic
                                + " de Logic. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Perception/Percepção?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Perc";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Logic "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Perc":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Perception = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Perception = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Perception
                                + " de Perception. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Will/Vontade?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Will";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Perception "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Will":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Will = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Will = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Will
                                + " de Will. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Deception/Decepção?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Dec";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Will "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                    
                case "OL: stating Dec":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Deception = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Deception = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Deception
                                + " de Deception. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Persuasion/Persuasão?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Pers";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Deception "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;

                case "OL: stating Pers":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Persuasion = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Persuasion = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Persuasion
                                + " de Persuasion. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Presence/Presença?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Prese";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Persuasion "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;

                case "OL: stating Prese":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Presence = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Presence = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Presence
                                + " de Presence. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Alteration/Alteração?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Alt";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Presence "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Alt":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Alteration = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Alteration = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Alteration
                                + " de Alteration. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Creation/Criação?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Cre";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Alteration "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Cre":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Creation = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Creation = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Creation
                                + " de Creation. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Energy/Energia?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Ene";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Creation "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Ene":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Energy = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Energy = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Energy
                                + " de Energy. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Entropy/Entropia?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Ent";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Energy "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Ent":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Entropy = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Entropy = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Entropy
                                + " de Entropy. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Influence/Influência?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Inf";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Entropy "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: stating Inf":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Influence = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Influence = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Influence
                                + " de Influence. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Movement/Movimento?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Mov";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Influence "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
            
                case "OL: stating Mov":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Movement = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Movement = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Movement
                                + " de Movement. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Prescience/Presciência?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Presc";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Movement "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
            
                case "OL: stating Presc":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Prescience = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Prescience = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Prescience
                                + " de Prescience. E quanto "+ users[id].chars[users[id].chars.length-1].name +" tem de Protection/Proteção?";
                        users[id].chars[users[id].chars.length-1].step = "OL: stating Pro";
                        message.author.send(msg);
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Prescience "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
            
                case "OL: stating Pro":
                    // if the response was a number
                    if (/[0-9]+/.test(message.content)) {
                        // if negative number
                        if (/- *[0-9]+/.test(message.content))
                            users[id].chars[users[id].chars.length-1].Protection = -1*Number(/[0-9]+/.exec(message.content)[0]);
                        // if positive
                        else
                            users[id].chars[users[id].chars.length-1].Protection = Number(/[0-9]+/.exec(message.content)[0]);
                        let msg = "Ok! Então "+ users[id].chars[users[id].chars.length-1].name +" tem "+ users[id].chars[users[id].chars.length-1].Protection
                                + " de Protection.";
                        message.author.send(msg);

                    // pegar attributo de ataque do personagem
                    users[id].chars[users[id].chars.length-1].step = "OL: damage attr";
                    message.author.send("Qual attributo "+ users[id].chars[users[id].chars.length-1].name +" usa para atacar?");
                    }
                    // if the response was not a number
                    else {
                        let msg = "Isso não é um número. Aprenda a digitar números. Quanto de Protection "+ users[id].chars[users[id].chars.length-1].name +" tem?";
                        message.author.send(msg);
                    }
                    break;
                
                case "OL: damage attr":
                    FB.useAttribute(message.content.trim().toLowerCase(), (Attribute) => {
                        users[id].chars[users[id].chars.length-1].attackAttribute = Attribute;
                        users[id].chars[users[id].chars.length-1].step = "complete";
                        delete users[id].isCreatingChar;

                        // taking care of the character's max resources
                        users[id].chars[users[id].chars.length-1].maxHP = FB.getMaxHP(users[id].chars[users[id].chars.length-1]);
                        users[id].chars[users[id].chars.length-1].HP = users[id].chars[users[id].chars.length-1].maxHP;
                        users[id].chars[users[id].chars.length-1].maxMP = FB.getMaxMP(users[id].chars[users[id].chars.length-1]);
                        users[id].chars[users[id].chars.length-1].MP = users[id].chars[users[id].chars.length-1].maxMP;
                        users[id].chars[users[id].chars.length-1].maxStamina = FB.getMaxStamina(users[id].chars[users[id].chars.length-1]);
                        users[id].chars[users[id].chars.length-1].Stamina = users[id].chars[users[id].chars.length-1].maxStamina;

                        // se o usuário não tem personagem anterior, colocar novo personagem como ativo
                        if (users[id].chars.length === 1)
                            users[id].activeCharId = 0;

                        message.author.send("Criação de personagem completa!");
                    }, (invAttribute) => {
                        message.author.send(invAttribute + " não é um atributo válido. Aprenda a escrever.");
                    });
                    break;
                default:
                    break;
            }
        }
        // se esta escolhendo o personagem ativo
        else if (users[id].isChosingActiveChar) {
            let curChar = users[id].chars[users[id].activeCharId];  // currently actyive char
            // if the response was not a number
            if (!/[0-9]+/.test(message.content)) {
                message.author.send("Isso não é um número válido para as opções apresentadas. Aprenda a digitar números. Tente de novo.");
            }
            // se é um numero
            else {
                // se é o personagem ativo atual
                if (users[id].activeCharId === Number(/[0-9]+/.exec(message.content)[0]) - 1) {
                    message.author.send(curChar.name+" já é o personagem ativo.");
                    delete users[id].isChosingActiveChar;
                }
                // se é um personagem válido que não o atual
                else {
                    users[id].possibleNewActiveCharID = Number(/[0-9]+/.exec(message.content)[0]) - 1;
                    users[id].isConfirmingNewActiveChar = true;
                    message.author.send("Mudar personagem ativo de "+ curChar.name
                    +" para "+users[id].chars[users[id].possibleNewActiveCharID].name+"?");
                    delete users[id].isChosingActiveChar;
                }
            }
        }
        // se esta confirmando um novo personagem ativo
        else if (users[id].isConfirmingNewActiveChar) {
            // se quer mudar o personagem 
            if (message.content.toLowerCase().trim() === "yes" || message.content.toLowerCase().trim() === "y" ||
                message.content.toLowerCase().trim() === "sim" || message.content.toLowerCase().trim() === "s") {
                users[id].activeCharId = users[id].possibleNewActiveCharID;
                delete users[id].possibleNewActiveCharID;
                delete users[id].isConfirmingNewActiveChar;
                message.author.send("Personagem ativo mudado para " + users[id].chars[users[id].activeCharId].name + ".");
            }
            // se não quer mudar o personagem
            else {
                delete users[id].possibleNewActiveCharID;
                delete users[id].isConfirmingNewActiveChar;
                message.author.send("Personagem ativo ("+ curChar.name +") mantido");
            }
        }

        // guardar as informações no arquivo do usuário
        fileIO.write('users/'+message.author.id+'.json', JSON.stringify(users[id]));
    }
})

bot.login('NDAxNTM3MTYzMTEzNjYwNDM2.DUFImw.DhpAJ_Qd2hoIe14WdAK0KAd3qhI');