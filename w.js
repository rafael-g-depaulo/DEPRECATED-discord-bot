const fileIO = require('./fileIO.js');

let a = 00100204001002003;
let character = {};

fileIO.write(a+'.json', JSON.stringify(character));