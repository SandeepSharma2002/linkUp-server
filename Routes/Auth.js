const express = require("express");
const router = express.Router();

const {
  signup,
  sendotp,
  login,
  changePassword,
} = require("../Controllers/Auth");
const { auth } = require("../middlewares/auth");

router.post("/sendotp", sendotp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/change-password",auth,changePassword);

module.exports = router;
