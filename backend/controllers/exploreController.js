const Group = require("../models/Group");
const Question = require("../models/Question");
const Bookmark = require("../models/Bookmark");

// @desc    Get public groups
// @route   GET /api/explore/groups
// @access  Private
const getPublicGroups = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		const groups = await Group.find({ isPublic: true })
			.populate("owner", "username")
			.sort({ questionCount: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Group.countDocuments({ isPublic: true });

		res.json({
			success: true,
			data: groups,
			total,
			page,
			pages: Math.ceil(total / limit),
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Get recently added public questions
// @route   GET /api/explore/questions
// @access  Private
const getPublicQuestions = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		const filter = { isPublic: true };
		if (req.query.tag) filter.tags = req.query.tag;
		if (req.query.difficulty) filter.difficulty = req.query.difficulty;
		if (req.query.search)
			filter.title = { $regex: req.query.search, $options: "i" };

		const questions = await Question.find(filter)
			.populate("owner", "username")
			.populate("group", "name")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.select("-approach"); // Don't send full approach in list view

		const total = await Question.countDocuments(filter);

		// If user is logged in, attach bookmark status
		const questionIds = questions.map((q) => q._id);
		const userBookmarks = await Bookmark.find({
			user: req.user._id,
			question: { $in: questionIds },
		}).select("question");
		const bookmarkedSet = new Set(
			userBookmarks.map((b) => b.question.toString()),
		);

		const enriched = questions.map((q) => ({
			...q.toObject(),
			isBookmarked: bookmarkedSet.has(q._id.toString()),
		}));

		res.json({
			success: true,
			data: enriched,
			total,
			page,
			pages: Math.ceil(total / limit),
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Get a single public question with approach
// @route   GET /api/explore/questions/:id
// @access  Private
const getPublicQuestion = async (req, res) => {
	try {
		const question = await Question.findOne({
			_id: req.params.id,
			isPublic: true,
		})
			.populate("owner", "username")
			.populate("group", "name");

		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });

		const isBookmarked = await Bookmark.exists({
			user: req.user._id,
			question: question._id,
		});

		res.json({
			success: true,
			data: { ...question.toObject(), isBookmarked: !!isBookmarked },
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

module.exports = { getPublicGroups, getPublicQuestions, getPublicQuestion };
