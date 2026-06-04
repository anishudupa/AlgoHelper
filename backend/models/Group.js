const mongoose = require("mongoose");

// A Group is a topic category like "Dynamic Programming > Knapsack"
// Groups can be nested via parentGroup for sub-topics

const GroupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Group name is required"],
			trim: true,
			maxlength: 100,
		},
		description: {
			type: String,
			default: "",
			maxlength: 500,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		parentGroup: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
			default: null, // null = top-level group
		},
		isPublic: {
			type: Boolean,
			default: false,
		},
		// Aggregated count — updated on question add/remove
		questionCount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

// Compound index: unique group name per user at the same parent level
GroupSchema.index({ owner: 1, name: 1, parentGroup: 1 }, { unique: true });

module.exports = mongoose.model("Group", GroupSchema);
