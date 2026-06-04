const express = require("express");
const router = express.Router();
const {
	getBookmarks,
	addBookmark,
	removeBookmark,
} = require("../controllers/bookmarksController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getBookmarks);
router.post("/:questionId", addBookmark);
router.delete("/:questionId", removeBookmark);

module.exports = router;
