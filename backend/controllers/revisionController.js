const Question = require("../models/Question");
const RevisionSession = require("../models/RevisionSession");

// @desc    Get a random question for revision from a group
// @route   GET /api/revision/next?group=<id>&mode=all|needs_practice
// @access  Private
const getNextQuestion = async (req, res) => {
	try {
		const { group, mode } = req.query;

		if (!group)
			return res
				.status(400)
				.json({ success: false, message: "group query param required" });

		const filter = { owner: req.user._id, group };
		if (mode === "needs_practice") filter.revisionStatus = "needs_practice";
		else if (mode === "unseen") filter.revisionStatus = "unseen";
		// default mode = 'all' — any question

		// Count matching questions and pick a random one
		const count = await Question.countDocuments(filter);
		if (count === 0) {
			return res.json({
				success: true,
				data: null,
				message: "No questions available",
			});
		}

		const random = Math.floor(Math.random() * count);
		const question = await Question.findOne(filter)
			.skip(random)
			.select("-approach");

		res.json({ success: true, data: question });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Reveal approach for a question
// @route   GET /api/revision/:questionId/reveal
// @access  Private
const revealApproach = async (req, res) => {
	try {
		const question = await Question.findOne({
			_id: req.params.questionId,
			owner: req.user._id,
		}).select("approach title difficulty tags");

		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });

		res.json({ success: true, data: question });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Mark a question after revision
// @route   POST /api/revision/:questionId/mark
// @access  Private
// @body    { result: 'understood' | 'needs_practice', groupId }
const markQuestion = async (req, res) => {
	try {
		const { result, groupId } = req.body;
		if (!["understood", "needs_practice"].includes(result)) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid result value" });
		}

		const question = await Question.findOne({
			_id: req.params.questionId,
			owner: req.user._id,
		});
		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });

		// Update question revision state
		question.revisionStatus = result;
		question.lastRevisedAt = new Date();
		question.revisionCount += 1;
		await question.save();

		// Log the session
		await RevisionSession.create({
			user: req.user._id,
			question: question._id,
			group: groupId || question.group,
			result,
		});

		res.json({ success: true, data: { revisionStatus: result } });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

module.exports = { getNextQuestion, revealApproach, markQuestion };
