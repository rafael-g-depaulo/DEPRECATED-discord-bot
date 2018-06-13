let players = [
    "Vinicius",
    "Higor",
    "JL",
    "Jorge"
]

let final = [
    "Shuster",
    "Thiago",
    "Luthy",
    "Thales",
    "Moises"
]

var stdin = process.openStdin();
stdin.addListener("data", (d) => {
    let i = Math.floor(Math.random() * players.length);
    final.push(players.slice(i,1+i).pop());
    players.splice(i, 1);
    console.log(final)
})