// var numRolls = 10000;

// var totalAdv2 = 0
// var totalAdv1 = 0
// var totalDis = 0
// var dice = 20

// var roll1, roll2, roll3;
// for (i = 0; i < numRolls; i++) {
//   roll1 = Math.floor(Math.random() * dice + 1)
//   roll2 = Math.floor(Math.random() * dice + 1)
//   roll3 = Math.floor(Math.random() * dice + 1)

//   if (roll1 > roll2) {
//     totalAdv1 += roll1
//     totalDis += roll2
//     if (roll3 > roll1)
//       totalAdv2 += roll3
//     else
//       totalAdv2 += roll1
//   }
//   else {
//     totalAdv1 += roll2;
//     totalDis += roll1;
//     if (roll3 > roll2)
//       totalAdv2 += roll3;
//     else
//       totalAdv2 += roll2;
//   }
// }

// totalAdv1 /= numRolls;
// totalAdv2 /= numRolls;
// totalDis /= numRolls;

// console.log("media para 1d"+dice+":\n")
// console.log("media com vantagem 1: "+ totalAdv1)
// console.log("media com vantagem 2: "+ totalAdv2)
// console.log("media normal: "+ (dice+1)/2)
// console.log("media com desvantagem: "+ totalDis)


// // const Dice = require('./dice.js')

// // var totalRoll = 0;
// // const diceQnt = 2;
// // const diceMax = 6;
// // const x = 1000;

// // for (var i = 0; i < x; i++) {
// //   totalRoll += Dice.rollDie({
// //     diceMax: diceMax,
// //     diceQnt: diceQnt,
// //     diceBonus: 0,
// //     diceAdv: 0,
// //     explode: true,
// //     superExplode: false
// //   }).resultSum
// // }

// // console.log(diceQnt+"d"+diceMax+"!: "+(totalRoll/x))


const Dice = require('./dice.js')
const dice = {
  diceMax: 6,
  diceQnt: 2,
  diceBonus: 6,
  diceAdv: 0,
  explode: false,
  superExplode: false
}
const a = /(\+*|-*) *[0-9]+ +(\+*|-*) *[0-9]+ +[0-9]+/, b = /[0-9]+ +[0-9]+ +[0-9]+/;
let command = "!damageCalc14 +++ 2     445"
let guard = 0, dodge = 0, dmgIn = 0;
// if guard and dodge inserted
if (a.test(command)) {
    let buffStr = /(\+*|-*) *[0-9]+/.exec(command)[0]
    command = command.slice(/(\+|-)* *[0-9]+/.exec(command).index + buffStr.length)
    if (buffStr.search('-') !== -1)
      guard = -1*Number(/[0-9]+/.exec(buffStr)[0])
    else
      guard =    Number(/[0-9]+/.exec(buffStr)[0])
    
    buffStr = /(\+*|-*) *[0-9]+/.exec(command)[0]
    command = command.slice(/(\+*|-*) *[0-9]+/.exec(command).index + buffStr.length)
    if (buffStr.search('-') !== -1)
      dodge = -1*Number(/[0-9]+/.exec(buffStr)[0])
    else
      dodge =    Number(/[0-9]+/.exec(buffStr)[0])

    buffStr = /(\+*|-*) *[0-9]+/.exec(command)[0]
    command = command.slice(/(\+*|-*) *[0-9]+/.exec(command).index + buffStr.length)
    if (buffStr.search('-') !== -1)
      dmgIn = -1*Number(/[0-9]+/.exec(buffStr)[0])
    else
      dmgIn =    Number(/[0-9]+/.exec(buffStr)[0])
}
// console.log(guard)
// console.log(dodge)
// console.log(dmgIn)
console.log(/greg/i.test("Greg"))
// console.log("STR: "+Dice.rollDie(dice).resultSum)
// console.log("DEX: "+Dice.rollDie(dice).resultSum)
// console.log("CON: "+Dice.rollDie(dice).resultSum)
// console.log("INT: "+Dice.rollDie(dice).resultSum)
// console.log("WIS: "+Dice.rollDie(dice).resultSum)
// console.log("CAR: "+Dice.rollDie(dice).resultSum)