const prisma = require("../config/prisma");

exports.getMatches = async (req, res) => {

 try {

  const matches = await prisma.match.findMany();

  res.json(matches);

 } catch (error) {

  res.status(500).json({ error: "Failed to fetch matches" });

 }

};

exports.getMatchById = async (req, res) => {

 try {

  const match = await prisma.match.findUnique({
   where: {
    id: Number(req.params.id)
   }
  });

  if (!match) {
   return res.status(404).json({ message: "Match not found" });
  }

  res.json(match);

 } catch (error) {

  res.status(500).json({ error: "Error fetching match" });

 }

};

exports.finishMatch = async (req, res) => {

 try {

  const { result } = req.body;
  const matchId = Number(req.params.id);

  const match = await prisma.match.update({
   where: { id: matchId },
   data: {
    status: "finished",
    result: result
   }
  });

  const bets = await prisma.bet.findMany({
   where: { matchId: matchId }
  });

  for (const bet of bets) {

   if (bet.betType === result) {

    await prisma.user.update({
     where: { id: bet.userId },
     data: {
      coins: {
       increment: bet.potentialWin
      }
     }
    });

    await prisma.bet.update({
     where: { id: bet.id },
     data: { result: "WIN" }
    });

   } else {

    await prisma.bet.update({
     where: { id: bet.id },
     data: { result: "LOSE" }
    });

   }

  }

  res.json({
   message: "Match finished and bets resolved"
  });

 } catch (error) {

  res.status(500).json({
   error: "Failed to finish match"
  });

 }

};