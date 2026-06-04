const Bookmark = require("../models/Bookmark");
const Question = require("../models/Question");

// @desc    Get all bookmarks for current user
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
	try {
		const bookmarks = await Bookmark.find({ user: req.user._id })
			.populate({
				path: "question",
				select: "title difficulty tags owner isPublic approach",
				populate: { path: "owner", select: "username" },
			})
			.sort({ createdAt: -1 });

		res.json({ success: true, data: bookmarks });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Bookmark a public question
// @route   POST /api/bookmarks/:questionId
// @access  Private
const addBookmark = async (req, res) => {
	try {
		const question = await Question.findById(req.params.questionId);

		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });
		if (!question.isPublic)
			return res
				.status(403)
				.json({ success: false, message: "Question is not public" });

		const bookmark = await Bookmark.create({
			user: req.user._id,
			question: req.params.questionId,
		});

		res.status(201).json({ success: true, data: bookmark });
	} catch (err) {
		if (err.code === 11000) {
			return res
				.status(400)
				.json({ success: false, message: "Already bookmarked" });
		}
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Remove a bookmark
// @route   DELETE /api/bookmarks/:questionId
// @access  Private
const removeBookmark = async (req, res) => {
	try {
		const result = await Bookmark.findOneAndDelete({
			user: req.user._id,
			question: req.params.questionId,
		});

		if (!result)
			return res
				.status(404)
				.json({ success: false, message: "Bookmark not found" });

		res.json({ success: true, message: "Bookmark removed" });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

module.exports = { getBookmarks, addBookmark, removeBookmark };
