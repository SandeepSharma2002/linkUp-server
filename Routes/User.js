const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");

const {
  getUserProfile,
  searchUsers,
  updateUserLogo,
  getCurrentUserProfile,
  getUsersList,
} = require("../Controllers/User");
const { uploadFile } = require("../utils/imageUploader");

router.get("/user-profile", auth, getUserProfile);
router.get("/current-user", auth, getCurrentUserProfile);
router.get("/search-users", auth, searchUsers);
router.get("/get-users", auth, getUsersList);
router.post("/upload-image", auth, uploadFile.single("image"), updateUserLogo);

module.exports = router;
