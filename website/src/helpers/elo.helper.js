//console.log(baserank)

let newelo

let player = {
  wins: 5,
  losses: 2,
  elo: 16228
}

let gamewon = true 

if(player.wins < 5){
  let base = 9000
  let winAdj = 1500
  let lossAdj = 1300
  
  let wins = player.wins 
  let losses = player.losses 
  
  if(gamewon){
    wins += 1 
  } else {
    losses += 1 
  }
  
  losses = Math.min(losses, 10)
  
  newelo = base + (winAdj * wins) - (lossAdj * losses) 
} else {
  let opponentELOs = [
    3500,
    3000,
    1000,
    3000,
    4000
  ];
  
  let opponentELOSum = 0 
  opponentELOs.forEach(elo=>{ opponentELOSum += elo })
  
  //let opponentELOAverage = opponentELOSum / 5 
  let opponentELOAverage = 20000

  let eloAdjustScale
  let eloIncrement = 300
  
  if(gamewon){
    eloAdjustScale = Math.pow(opponentELOAverage / player.elo, 1.4)
  } else {
    eloAdjustScale = Math.pow(player.elo / opponentELOAverage, 1.3)
  }
  
  eloAdjustScale = Math.min(Math.max(eloAdjustScale, 0.5), 2)
  
  eloIncrement = eloIncrement * eloAdjustScale
  
  if(gamewon){
    eloIncrement = Math.max(eloIncrement, 200)
  } else {
    eloIncrement = eloIncrement * -1
    eloIncrement = Math.max(eloIncrement, -500)
  }
  console.log(eloIncrement)
  
  newelo = player.elo + eloIncrement
}

console.log(newelo)
