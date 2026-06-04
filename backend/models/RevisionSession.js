const mongoose = require("mongoose");

// Stores each time a user marks a question during revision
const RevisionSessionSchema = new mongoose.Schema(
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
		group: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
			required: true,
		},
		result: {
			type: String,
			enum: ["understood", "needs_practice"],
			required: true,
		},
	},
	{ timestamps: true },
);

RevisionSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("RevisionSession", RevisionSessionSchema);
