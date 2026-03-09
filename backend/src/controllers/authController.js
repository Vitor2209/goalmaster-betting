const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

exports.register = async (req, res) => {

 try {

  const { username, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
   where: { email }
  });

  if (existingUser) {
   return res.status(400).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
   data: {
    username,
    email,
    password: hashedPassword
   }
  });

  res.json({
   message: "User created",
   user
  });

 } catch (error) {

  res.status(500).json({ error: "Registration failed" });

 }

};


exports.login = async (req, res) => {

 try {

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
   where: { email }
  });

  if (!user) {
   return res.status(401).json({ message: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
   return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
   { id: user.id },
   process.env.JWT_SECRET,
   { expiresIn: "1d" }
  );

  res.json({
   token,
   user
  });

 } catch (error) {

  res.status(500).json({ error: "Login failed" });

 }

};