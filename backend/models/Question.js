const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Question title is required"],
			trim: true,
			maxlength: 200,
		},
		difficulty: {
			type: String,
			enum: ["Easy", "Medium", "Hard"],
			required: [true, "Difficulty is required"],
		},
		tags: {
			type: [String],
			default: [],
		},
		// Link to LeetCode / GeeksForGeeks etc.
		sourceUrl: {
			type: String,
			default: "",
		},
		group: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isPublic: {
			type: Boolean,
			default: false,
		},
		// TipTap rich-text JSON content stored as a single object
		approach: {
			type: Object, // TipTap JSON doc
			default: null,
		},
		// Revision tracking
		revisionStatus: {
			type: String,
			enum: ["unseen", "needs_practice", "understood"],
			default: "unseen",
		},
		lastRevisedAt: {
			type: Date,
			default: null,
		},
		revisionCount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

QuestionSchema.index({ owner: 1, group: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ isPublic: 1 });

module.exports = mongoose.model("Question", QuestionSchema);
