const prisma = require("../config/prisma");

exports.placeBet = async (req, res) => {

 try {

  const { matchId, betType, amount } = req.body;

  const userId = req.user.id;

  const user = await prisma.user.findUnique({
   where: { id: userId }
  });

  if (!user) {
   return res.status(404).json({ message: "User not found" });
  }

  if (user.coins < amount) {
   return res.status(400).json({ message: "Insufficient coins" });
  }

  const match = await prisma.match.findUnique({
   where: { id: matchId }
  });

  if (match.status === "finished") {
 return res.status(400).json({
  message: "Betting closed for this match"
 });
}

  if (!match) {
   return res.status(404).json({ message: "Match not found" });
  }

  let odds;

  if (betType === "HOME") odds = match.homeOdds;
  if (betType === "DRAW") odds = match.drawOdds;
  if (betType === "AWAY") odds = match.awayOdds;

  const potentialWin = amount * odds;

  const bet = await prisma.bet.create({
   data: {
    userId,
    matchId,
    betType,
    amount,
    odds,
    potentialWin
   }
  });

  await prisma.user.update({
   where: { id: userId },
   data: {
    coins: {
     decrement: amount
    }
   }
  });

  res.json({
   message: "Bet placed successfully",
   bet
  });

 } catch (error) {

  res.status(500).json({ error: "Bet creation failed" });

 }

};

exports.getBetHistory = async (req, res) => {

 try {

  const bets = await prisma.bet.findMany({
   where: {
    userId: req.user.id
   }
  });

  res.json(bets);

 } catch (error) {

  res.status(500).json({ error: "Failed to fetch bets" });

 }

};