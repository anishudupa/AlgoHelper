const Question = require("../models/Question");
const RevisionSession = require("../models/RevisionSession");

// @desc    Get progress statistics for current user
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
	try {
		const userId = req.user._id;

		// Total count and breakdown by difficulty
		const difficultyStats = await Question.aggregate([
			{ $match: { owner: userId } },
			{ $group: { _id: "$difficulty", count: { $sum: 1 } } },
		]);

		// Count by revision status
		const statusStats = await Question.aggregate([
			{ $match: { owner: userId } },
			{ $group: { _id: "$revisionStatus", count: { $sum: 1 } } },
		]);

		// Top 10 most used tags
		const tagStats = await Question.aggregate([
			{ $match: { owner: userId } },
			{ $unwind: "$tags" },
			{ $group: { _id: "$tags", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 },
		]);

		// Revision performance (last 30 days)
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const revisionStats = await RevisionSession.aggregate([
			{ $match: { user: userId, createdAt: { $gte: thirtyDaysAgo } } },
			{ $group: { _id: "$result", count: { $sum: 1 } } },
		]);

		// Daily revision activity (last 14 days for streak/heatmap)
		const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
		const dailyActivity = await RevisionSession.aggregate([
			{ $match: { user: userId, createdAt: { $gte: fourteenDaysAgo } } },
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// Total question count
		const totalQuestions = await Question.countDocuments({ owner: userId });

		res.json({
			success: true,
			data: {
				totalQuestions,
				byDifficulty: difficultyStats,
				byStatus: statusStats,
				topTags: tagStats,
				revisionLast30Days: revisionStats,
				dailyActivity,
			},
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

module.exports = { getProgress };
