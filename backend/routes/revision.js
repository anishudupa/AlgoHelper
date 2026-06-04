const express = require("express");
const router = express.Router();
const {
	getNextQuestion,
	revealApproach,
	markQuestion,
} = require("../controllers/revisionController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/next", getNextQuestion);
router.get("/:questionId/reveal", revealApproach);
router.post("/:questionId/mark", markQuestion);

module.exports = router;
