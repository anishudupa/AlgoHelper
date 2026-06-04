const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // 10mb to handle TipTap rich content
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/bookmarks", require("./routes/bookmarks"));
app.use("/api/revision", require("./routes/revision"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/explore", require("./routes/explore"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.statusCode || 500).json({
		success: false,
		message: err.message || "Server Error",
	});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
