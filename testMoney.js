const cmds = [
  "money + 12 silver",
  "money + 7 gold",
  "money - 3 ouro",
  "money + 45 cobre",
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
  money: {
    copper: 0,
    silver: 0,
    gold: 0,
  },
}

// start
const moneyChange = (cmd) => {
  const regex = new RegExp(`(\\+|-) * ([0-9]+) (${Object.values(MoneyWords).map(x => x.join('|')).join('|')})`, 'i')
  if (!regex.test(cmd)) {
    retVal.msg += "Aprenda a usar o comando, idiota. o formato certo é \"!money (+|-) x (bronze|prata|ouro)\""
  }
  else {
    const [ _, addOrRemove, ammount_str, kind_str ] = regex.exec(cmd)

    // make regexes for kind with moneywords
    const copperRegex = new RegExp(`(${MoneyWords.copper.join('|')})`, 'i')
    const silverRegex = new RegExp(`(${MoneyWords.silver.join('|')})`, 'i')
    const goldRegex   = new RegExp(`(${MoneyWords.gold.join('|')})`, 'i')

    // get kind of currency to add using regexes
    const kind =
      goldRegex.test(kind_str) ? 'gold' :
      silverRegex.test(kind_str) ? 'silver' :
      copperRegex.test(kind_str) ? 'copper' : 'invalid'

    // if no correct kind inserted
    if (kind === 'invalid') 
      retVal.msg += "Aprenda a usar o comando, idiota. o formato certo é \"!money (+|-) x (bronze|prata|ouro)\""
    else {
      const isAdd = addOrRemove === '+'
      const ammount = isAdd ? Number(ammount_str) : -1 * Number(ammount_str)
      retVal.msg += `${isAdd ? 'Adicionado' : 'Removido'} ${Math.abs(ammount)} moedas de ${kind} ${isAdd ? 'para' : 'de'} ${char.name}. (${char.money[kind]} -> ${char.money[kind] + ammount})`
      char.money[kind] += ammount
    }
  }
}
// end

cmds.forEach(moneyChange)

console.log(retVal.msg)