const Question = require("../models/Question");
const Group = require("../models/Group");

// @desc    Get all questions (optionally filter by group/tag/difficulty)
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
	try {
		const filter = { owner: req.user._id };
		if (req.query.group) filter.group = req.query.group;
		if (req.query.difficulty) filter.difficulty = req.query.difficulty;
		if (req.query.tag) filter.tags = req.query.tag;
		if (req.query.status) filter.revisionStatus = req.query.status;

		// Text search on title
		if (req.query.search) {
			filter.title = { $regex: req.query.search, $options: "i" };
		}

		const questions = await Question.find(filter)
			.populate("group", "name")
			.sort({ createdAt: -1 });

		res.json({ success: true, data: questions });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private
const getQuestion = async (req, res) => {
	try {
		const question = await Question.findOne({
			_id: req.params.id,
			owner: req.user._id,
		}).populate("group", "name isPublic");

		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });

		res.json({ success: true, data: question });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Create a question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res) => {
	try {
		const { title, difficulty, tags, sourceUrl, group, isPublic, approach } =
			req.body;

		// Verify group belongs to user
		const grp = await Group.findOne({ _id: group, owner: req.user._id });
		if (!grp)
			return res.status(400).json({ success: false, message: "Invalid group" });

		const question = await Question.create({
			title,
			difficulty,
			tags: tags || [],
			sourceUrl,
			group,
			isPublic: isPublic || false,
			approach: approach || null,
			owner: req.user._id,
		});

		// Increment group count
		await Group.findByIdAndUpdate(group, { $inc: { questionCount: 1 } });

		res.status(201).json({ success: true, data: question });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Update a question (including approach content)
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res) => {
	try {
		const question = await Question.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });

		const { title, difficulty, tags, sourceUrl, isPublic, approach, group } =
			req.body;

		// If moving to a different group, update both group counts
		if (group && group !== question.group.toString()) {
			const newGroup = await Group.findOne({ _id: group, owner: req.user._id });
			if (!newGroup)
				return res
					.status(400)
					.json({ success: false, message: "Invalid group" });

			await Group.findByIdAndUpdate(question.group, {
				$inc: { questionCount: -1 },
			});
			await Group.findByIdAndUpdate(group, { $inc: { questionCount: 1 } });
			question.group = group;
		}

		if (title !== undefined) question.title = title;
		if (difficulty !== undefined) question.difficulty = difficulty;
		if (tags !== undefined) question.tags = tags;
		if (sourceUrl !== undefined) question.sourceUrl = sourceUrl;
		if (isPublic !== undefined) question.isPublic = isPublic;
		if (approach !== undefined) question.approach = approach;

		await question.save();
		res.json({ success: true, data: question });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res) => {
	try {
		const question = await Question.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });

		await Group.findByIdAndUpdate(question.group, {
			$inc: { questionCount: -1 },
		});
		await question.deleteOne();

		res.json({ success: true, message: "Question deleted" });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

module.exports = {
	getQuestions,
	getQuestion,
	createQuestion,
	updateQuestion,
	deleteQuestion,
};
