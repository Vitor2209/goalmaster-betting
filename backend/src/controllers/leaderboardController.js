exports.getLeaderboard = (req, res) => {

  const leaderboard = [
    { username: "JoaoBet", coins: 4300 },
    { username: "AnaScore", coins: 3800 },
    { username: "RickGol", coins: 3200 }
  ];

  res.json(leaderboard);
};