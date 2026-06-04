const Group = require("../models/Group");
const Question = require("../models/Question");

// @desc    Get all groups for current user (tree structure)
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
	try {
		const groups = await Group.find({ owner: req.user._id }).sort({ name: 1 });

		// Build a nested tree: top-level groups with children embedded
		const map = {};
		groups.forEach((g) => (map[g._id] = { ...g.toObject(), children: [] }));

		const tree = [];
		groups.forEach((g) => {
			if (g.parentGroup && map[g.parentGroup]) {
				map[g.parentGroup].children.push(map[g._id]);
			} else {
				tree.push(map[g._id]);
			}
		});

		res.json({ success: true, data: tree });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Create a group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
	try {
		const { name, description, parentGroup, isPublic } = req.body;

		const group = await Group.create({
			name,
			description,
			parentGroup: parentGroup || null,
			isPublic: isPublic || false,
			owner: req.user._id,
		});

		res.status(201).json({ success: true, data: group });
	} catch (err) {
		if (err.code === 11000) {
			return res.status(400).json({
				success: false,
				message: "Group with this name already exists at this level",
			});
		}
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Update a group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
	try {
		const group = await Group.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!group)
			return res
				.status(404)
				.json({ success: false, message: "Group not found" });

		const { name, description, isPublic } = req.body;
		if (name !== undefined) group.name = name;
		if (description !== undefined) group.description = description;
		if (isPublic !== undefined) group.isPublic = isPublic;

		await group.save();
		res.json({ success: true, data: group });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Delete a group and all its questions
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
	try {
		const group = await Group.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!group)
			return res
				.status(404)
				.json({ success: false, message: "Group not found" });

		// Collect all descendant group IDs
		const allIds = await getAllDescendantIds(req.params.id);
		allIds.push(req.params.id);

		// Delete all questions in these groups
		await Question.deleteMany({ group: { $in: allIds } });
		// Delete all groups
		await Group.deleteMany({ _id: { $in: allIds } });

		res.json({ success: true, message: "Group and its contents deleted" });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Helper: recursively collect all child group IDs
const getAllDescendantIds = async (parentId) => {
	const children = await Group.find({ parentGroup: parentId }).select("_id");
	let ids = children.map((c) => c._id.toString());
	for (const child of children) {
		const subIds = await getAllDescendantIds(child._id);
		ids = ids.concat(subIds);
	}
	return ids;
};

module.exports = { getGroups, createGroup, updateGroup, deleteGroup };
