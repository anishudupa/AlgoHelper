const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			trim: true,
			minlength: 3,
			maxlength: 30,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: 6,
			select: false, // never returned in queries by default
		},
		avatar: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true },
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
