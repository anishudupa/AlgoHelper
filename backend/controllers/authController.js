const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message:
					existingUser.email === email
						? "Email already in use"
						: "Username taken",
			});
		}

		const user = await User.create({ username, email, password });

		res.status(201).json({
			success: true,
			token: generateToken(user._id),
			user: { _id: user._id, username: user.username, email: user.email },
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).select("+password");
		if (!user || !(await user.matchPassword(password))) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid credentials" });
		}

		res.json({
			success: true,
			token: generateToken(user._id),
			user: { _id: user._id, username: user.username, email: user.email },
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
	res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
