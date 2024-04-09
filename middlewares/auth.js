const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../Models/User");

//auth
exports.auth = async (req, res, next) => {
  try {
    //extract token
    const token =
      req.header("Authorization").replace("Bearer ", "") ||
      req.cookies.token ||
      req.body.token;

    //if token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token Is Missing",
      });
    }

    //verify token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decode);
      req.user = decode;
    } catch (error) {
      //verirfication - issue
      return res.status(401).json({
        success: false,
        message: "Token Is Invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something Went Wrong While Verifying Token",
    });
  }
};

//isUser
exports.isUser = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res.status(401).json({
        success: false,
        message: "This Is A Protectd Route For Users",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot Be Verified, Please Try Again",
    });
  }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.role !== "instructor") {
      return res.status(401).json({
        success: false,
        message: "This Is A Protectd Route For Instructor",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot Be Verified, Please Try Again",
    });
  }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "This Is A Protectd Route For Admin",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role Cannot Be Verified, Please Try Again",
    });
  }
};
