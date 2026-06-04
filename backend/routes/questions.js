const express = require("express");
const router = express.Router();
const {
	getQuestions,
	getQuestion,
	createQuestion,
	updateQuestion,
	deleteQuestion,
} = require("../controllers/questionsController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").get(getQuestions).post(createQuestion);
router
	.route("/:id")
	.get(getQuestion)
	.put(updateQuestion)
	.delete(deleteQuestion);

module.exports = router;
