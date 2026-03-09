const prisma = require("../config/prisma");

exports.getProfile = async (req, res) => {

 try {

  const user = await prisma.user.findUnique({
   where: {
    id: req.user.id
   },
   select: {
    id: true,
    username: true,
    email: true,
    coins: true,
    createdAt: true
   }
  });

  res.json(user);

 } catch (error) {

  res.status(500).json({
   error: "Failed to fetch user profile"
  });

 }

};