const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

 await prisma.match.createMany({
  data: [
   {
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    startTime: new Date(),
    status: "upcoming",
    homeOdds: 2.3,
    drawOdds: 3.1,
    awayOdds: 2.7
   },
   {
    homeTeam: "Liverpool",
    awayTeam: "Manchester City",
    startTime: new Date(),
    status: "upcoming",
    homeOdds: 2.6,
    drawOdds: 3.0,
    awayOdds: 2.4
   },
   {
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    startTime: new Date(),
    status: "upcoming",
    homeOdds: 2.2,
    drawOdds: 3.2,
    awayOdds: 2.8
   }
  ]
 });

 console.log("Matches inserted ⚽");

}

main()
 .catch((e) => {
  console.error(e);
 })
 .finally(async () => {
  await prisma.$disconnect();
 });