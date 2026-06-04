const mongoose = require("mongoose");

// A bookmark is a user saving someone else's public question for reference
const BookmarkSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		question: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Question",
			required: true,
		},
	},
	{ timestamps: true },
);

// One bookmark per question per user
BookmarkSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", BookmarkSchema);
