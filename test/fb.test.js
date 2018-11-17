const FB = require(`../lib/fantasyBattle`)


describe(`testing FB`, () => {
  test('useAttribute()', () => {
    
    // using useAttribute with valid attribute nickname
    expect(
      FB.useAttribute('mig',
        (att) => expect(att).toBe('Might')
      )
    ).toBe(true)

    // using useAttribute with invalid attribute nickname
    expect(
      FB.useAttribute('invalidAttributeName',
        () => {},
        (att) => expect(att).toBe('invalidAttributeName') 
      )
    ).toBe(false)
  })
})