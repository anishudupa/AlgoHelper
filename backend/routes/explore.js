const express = require("express");
const router = express.Router();
const {
	getPublicGroups,
	getPublicQuestions,
	getPublicQuestion,
} = require("../controllers/exploreController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/groups", getPublicGroups);
router.get("/questions", getPublicQuestions);
router.get("/questions/:id", getPublicQuestion);

module.exports = router;
