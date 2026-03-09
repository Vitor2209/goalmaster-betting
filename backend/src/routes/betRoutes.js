const express = require("express");
const router = express.Router();

const betController = require("../controllers/betController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, betController.placeBet);

router.get("/history", authMiddleware, betController.getBetHistory);

module.exports = router;