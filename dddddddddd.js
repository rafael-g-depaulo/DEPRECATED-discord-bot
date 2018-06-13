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