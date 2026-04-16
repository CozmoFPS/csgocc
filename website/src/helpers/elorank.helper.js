const corr = {
    0: 1,
    3500: 2,
    5000: 3,
    5700: 4,
    6900: 5,
    8000: 6,
    9000: 7,
    10000: 8,
    11000: 9,
    12300: 10,
    13500: 11,
    14500: 12,
    15500: 13,
    16500: 14
}

module.exports = function eloRank(elo){
    if(!elo)return null;

    let rank;
    for(let [minElo, earnedRank] of Object.entries(corr)){
        if(elo >= minElo){
            rank = earnedRank
        } else {
            break
        }
    }
    return rank;
}