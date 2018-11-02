const Dice   = require('../lib/dice.js');
const fileIO = require('../lib/fileIO.js');

// array of example roll commands
let createDie   // constructor
let worstLuck   // unluckyiest randomness function
let bestLuck    // luckiest randomness function
let goodLuck5   // returns 5 1's and then 0
let customLuck  // returns N 1's and then 0
let averageLuck // returns 0.5

describe('testing dice.js', () => {
  // create a constructor function for roll commands
  beforeAll(() => {
    // creating a dice roll
    createDie = (dQnt, dMax, dAdv, dBon, expl) => {
      dAdv = dAdv || 0
      dBon = dBon || 0
      expl = expl || false

      return {
        diceQnt: dQnt,
        diceMax: dMax,
        diceAdv: dAdv,
        diceBonus: dBon,
        explode: expl
      }
    }
    
    
    worstLuck   = () => 0     // bad luck randomness function
    averageLuck = () => 0.5   // average luck randomness function
    bestLuck    = () => 1     // great luck randomness function
    // function that returns 5 1's and then 0
    goodLuck5 = () => {
      this.luck = this.luck || 5
      if (--this.luck > 0) return 1
      else {
        this.luck = 5; return 0
      }
    }
    // good luck timer

    customLuck = (goodTimer, badTimer) => {
      let retVal = () => {
        // if fist call -> set up luck
        if (!('luck' in retVal))
          retVal.luck = goodTimer
        // if still on good luck -> return 1 (also decrease luck regardless)
        if (retVal.luck-- > 0) return 1
        // if bad luck ended -> reset to good luck 
        if (retVal.luck <= -badTimer)
          retVal.luck = goodTimer
        // if still in bad luck -> return 0
        return 0
      }
      return retVal
  }})

  describe('testing isDiceRollCmd()', () => {
    
    // standard
    test('[x]d[y]', () => {
      expect(Dice.isDiceRollCmd("1d2"))    .toBe(true)
      expect(Dice.isDiceRollCmd("3d55"))   .toBe(true)
      expect(Dice.isDiceRollCmd("123d44")) .toBe(true)
    }),

    // with spaces
    test('[x] d [y]', () => {
      expect(Dice.isDiceRollCmd("5d 6"))   .toBe(true)
      expect(Dice.isDiceRollCmd("24  d55")).toBe(true)
      expect(Dice.isDiceRollCmd("3  d 35")).toBe(true)
    }),

    // no first number
    test('d[y]', () => {
      expect(Dice.isDiceRollCmd("d23"))    .toBe(true)
      expect(Dice.isDiceRollCmd(" d8"))    .toBe(true)
      expect(Dice.isDiceRollCmd("d  7"))   .toBe(true)
    })

  }),

  describe('testing getDiceRoll()', () => {

    test('d[y]', () => {
      expect(Dice.getDiceRoll("d20")).toEqual([
        createDie(1, 20, 0, 0, false)
      ])

      expect(Dice.getDiceRoll("d12")).toEqual([
        createDie(1, 12, 0, 0, false)
      ])
    })

    test('[x]d[y]', () => {
      expect(Dice.getDiceRoll("1d20")).toEqual([
        createDie(1, 20, 0, 0, false)
      ])

      expect(Dice.getDiceRoll("3d12")).toEqual([
        createDie(3, 12, 0, 0, false)
      ])
    })

    test('[x] d[y]', () => {
      expect(Dice.getDiceRoll("1 d20")).toEqual([
        createDie(1, 20, 0, 0, false)
      ])

      expect(Dice.getDiceRoll("3   d12")).toEqual([
        createDie(3, 12, 0, 0, false)
      ])
    })

    test('[x]d [y]', () => {
      expect(Dice.getDiceRoll("2d 40")).toEqual([
        createDie(2, 40, 0, 0, false)
      ])

      expect(Dice.getDiceRoll("5d     14")).toEqual([
        createDie(5, 14, 0, 0, false)
      ])

    })
  })

  describe('testing rollDie()', () => {

    // standard
    test('[x]d[y]', () => {

      // one die, normal
      expect(Dice._rollDie(createDie(1, 20), averageLuck)).toEqual({
        list: "11",
        resultSum: 11,
        sum: "11"
      })

      // multiple die
      expect(Dice._rollDie(createDie(2, 10), bestLuck)).toEqual({
        list: "**10** e **10**",
        resultSum: 20,
        sum: "10 + 10 = 20"
      })

      // testing minimum and maximum value
      expect(Dice._rollDie(createDie(5, 10), goodLuck5)).toEqual({
        list: "**10**, **10**, **10**, **10** e 1",
        resultSum: 41,
        sum: "10 + 10 + 10 + 10 + 1 = 41"
      })
    }),

    // with bonus
    test('[x]d[y] +[z]', () => {

      expect(Dice._rollDie(createDie(2, 12, 0, 5), bestLuck)).toEqual({
        list: "**12** e **12**",
        resultSum: 29,
        sum: "12 + 12 (+5) = 29"
      })
    }),

    // with negative bonus
    test('[x]d[y] -[z]', () => {

      expect(Dice._rollDie(createDie(2, 12, 0, 5), bestLuck)).toEqual({
        list: "**12** e **12**",
        resultSum: 29,
        sum: "12 + 12 (+5) = 29"
      })
    }),

    // with positive advantage
    test('[x]d[y] adv+[z]', () => {

      expect(Dice._rollDie(createDie(2, 12, 4), customLuck(3, 1))).toEqual({
        list: "~~12~~, ~~12~~, ~~12~~, ~~1~~, **12** e **12**",
        resultSum: 24,
        sum: "12 + 12 = 24"
      })
    }),

    // with negative advantage
    test('[x]d[y] adv-[z]', () => {

      expect(Dice._rollDie(createDie(5, 8, -2), customLuck(2, 2))).toEqual({
        list: "~~8~~, ~~8~~, 1, 1, **8**, **8** e 1",
        resultSum: 19,
        sum: "1 + 1 + 8 + 8 + 1 = 19"
      })
      
      expect(Dice._rollDie(createDie(2, 8, -2), customLuck(2, 1))).toEqual({
        list: "~~8~~, ~~8~~, 1 e **8**",
        resultSum: 9,
        sum: "1 + 8 = 9"
      })
    }),

    // with advantage and bonus
    test('[x]d[y] +[z] adv+[w]', () => {

      expect(Dice._rollDie(createDie(2, 8, -2), customLuck(3, 1))).toEqual({
        list: "~~8~~, ~~8~~, **8** e 1",
        resultSum: 9,
        sum: "8 + 1 = 9"
      })

    }),

    test('[x]d[y] +/-[z] adv+/-[w]', () => {

      expect(Dice._rollDie(createDie(3, 6, 1, 2), customLuck(3, 1))).toEqual({
        list: "**6**, **6**, **6** e ~~1~~",
        resultSum: 20,
        sum: "6 + 6 + 6 (+2) = 20"
      })

      expect(Dice._rollDie(createDie(3, 6, -1, 2), customLuck(2, 1))).toEqual({
        list: "~~6~~, **6**, 1 e **6**",
        resultSum: 15,
        sum: "6 + 1 + 6 (+2) = 15"
      })

      expect(Dice._rollDie(createDie(3, 4, -2, -5), customLuck(2, 2))).toEqual({
        list: "~~4~~, ~~4~~, 1, 1 e **4**",
        resultSum: 1,
        sum: "1 + 1 + 4 (-5) = 1"
      })
    })
  }),

  describe('testing rollDice()', () => {

    test('single die, list', () => {
      let dice = [
        createDie(4, 8, -3, -7)
      ]

      expect(Dice.rollDice(dice, true, false, false, customLuck(2, 1))).toEqual(
        "__**4d8 -7 dis-3**__: ~~8~~, ~~8~~, 1, ~~8~~, **8**, 1 e **8**"
      )
    }),

    test('single die, sum', () => {
      let dice = [
        createDie(4, 8, -3, -7)
      ]

      expect(Dice.rollDice(dice, false, true, false, customLuck(2, 1))).toEqual(
        "__**4d8 -7 dis-3**__: 1 + 8 + 1 + 8 (-7) = 11"
      )
    })

    test('multiple dice, list', () => {
      let dice = [
        createDie(1, 20),
        createDie(2, 4, 6),
        createDie(3, 6, 0, 8),
        createDie(4, 8, -3, -7)
      ]

      expect(Dice.rollDice(dice, true, false, false, customLuck(3, 2))).toEqual(
        "1) __**1d20**__: **20**;\n\n2) __**2d4 adv+6**__: ~~4~~, ~~4~~, ~~1~~, ~~1~~, ~~4~~, **4**, **4** e ~~1~~;\n\n3) __**3d6 +8**__: 1, **6** e **6**;\n\n4) __**4d8 -7 dis-3**__: ~~8~~, 1, 1, ~~8~~, ~~8~~, **8** e 1")
    }),

    test('multiple dice, sum', () => {
      let dice = [
        createDie(1, 20),
        createDie(2, 4, 6),
        createDie(3, 6, 0, 8),
        createDie(4, 8, -3, -7)
      ]

      expect(Dice.rollDice(dice, false, true, false, customLuck(3, 2))).toEqual(
        "1) __**1d20**__: 20;\n\n2) __**2d4 adv+6**__: 4 + 4 = 8;\n\n3) __**3d6 +8**__: 1 + 6 + 6 (+8) = 21;\n\n4) __**4d8 -7 dis-3**__: 1 + 1 + 8 + 1 (-7) = 4")
    }),

    test('multiple dice, list, sum all', () => {
      let dice = [
        createDie(1, 20),
        createDie(2, 4, 6),
        createDie(3, 6, 0, 8),
        createDie(4, 8, -3, -7)
      ]

      expect(Dice.rollDice(dice, true, false, true, customLuck(3, 2))).toEqual(
        "1) __**1d20**__: **20**;\n\n2) __**2d4 adv+6**__: ~~4~~, ~~4~~, ~~1~~, ~~1~~, ~~4~~, **4**, **4** e ~~1~~;\n\n3) __**3d6 +8**__: 1, **6** e **6**;\n\n4) __**4d8 -7 dis-3**__: ~~8~~, 1, 1, ~~8~~, ~~8~~, **8** e 1\n\n\t**Soma:** 20 + 8 + 21 + 4 = **53**;\n")
    }),

    test('multiple dice, sum, sum all', () => {
      let dice = [
        createDie(1, 20),
        createDie(2, 4, 6),
        createDie(3, 6, 0, 8),
        createDie(4, 8, -3, -7)
      ]

      expect(Dice.rollDice(dice, false, true, true, customLuck(3, 2))).toEqual(
        "1) __**1d20**__: 20;\n\n2) __**2d4 adv+6**__: 4 + 4 = 8;\n\n3) __**3d6 +8**__: 1 + 6 + 6 (+8) = 21;\n\n4) __**4d8 -7 dis-3**__: 1 + 1 + 8 + 1 (-7) = 4\n\n\t**Soma:** 20 + 8 + 21 + 4 = **53**;\n")
    })
  })
})