const cmds = [
  "set level 5",
  "set    level    2",
]
const command = 'money'
const retVal = { msg: "" }
const CommandWords = {}
CommandWords.money = [
  "money",
  "gold",
  "dinheiro",
  "deniro",
]
CommandWords.level = [
  "level",
  "lvl",
  "nível",
  "nivel",
]
const MoneyWords = {
  copper: [
    "b", "c",
    "bronze",
    "cobre",
    "coper",
    "copper",
  ],
  silver: [
    "s", "p",
    "silver",
    "prata",
  ],
  gold: [
    "g",
    "gold",
    "ouro",
  ],
}

const char = {
  name: 'Ka',
  level: 0,
  money: {
    copper: 0,
    silver: 0,
    gold: 0,
  },
}

// start
const levelChange = (cmd) => {
  const regex = new RegExp(`set +(${CommandWords.level.join('|')}) +([0-9]+)`, 'i')
  if (!regex.test(cmd)) {
    retVal.msg += "Aprenda a usar o comando. o formato certo é \"!set level x\""
  }
  else {
    const level = Number(regex.exec(cmd)[2])
    const oldLevel = char.level
    char.level = level
    retVal.msg += `Level de ${char.name} mudado, de ${oldLevel} para ${level}`
  }
}
// end

cmds.forEach(levelChange)

console.log(retVal.msg)
console.log(char)