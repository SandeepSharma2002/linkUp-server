const bcrypt = require("bcrypt");
const User = require("../Models/User");
const OTP = require("../Models/OTP");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.sendotp = async (req, res) => {
  try {
    //fetch email from request body
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(403).json({
        success: false,
        message: "Email is Invalid.",
      });
    }

    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    //check if user already exists
    const checkUserPresent = await User.findOne({ email });

    //if user already exists, then return a response
    if (checkUserPresent) {
      //Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    //generate OTP
    var otp = otpGenerator.generate(6, {
      specialChars: false,
    });

    //check unique otp or not
    const result = await OTP.findOne({ otp: otp });
    // console.log('OTP Generated : ', otp);
    //if not unique
    if (result === null) {
      otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    }

    const otpPayload = { email, otp };
    //create an entry for OTP
    const otpBody = await OTP.create(otpPayload);
    // console.log('OTP Body', otpBody);

    //return response successfully
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      gender,
      phoneNumber,
      otp,
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All Fields are required",
      });
    }

    if (fullName.length < 3) {
      return res.status(403).json({
        success: false,
        message: "Fullname must be altleast 3 letters long.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(403).json({
        success: false,
        message: "Email is Invalid.",
      });
    }

    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    function isStrongPassword(password) {
      const isVerify = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/.test(password);
      return isVerify;
    }

    // if (!isStrongPassword(password)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please take Password under give constraints.",
    //   });
    // }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match. Please try again",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please Sign in to continue.",
      });
    }
    console.log(otp);

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    // console.log("Response: ", response);
    // //validate OTP
    if (response.length === 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    } else if (otp !== response[0].otp) {
      //Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }
    // Generating hashed password
    const hash_password = await bcrypt.hash(password, 10);
    const username = email.split("@")[0];
    let user = await User.create({
      fullName,
      email,
      username,
      gender,
      phoneNumber,
      password: hash_password,
    });

    return res.status(200).json({
      success: true,
      message: "User Register Successfully,Please Login to Continue",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User Cannot be Registered, Please Try Again.",
    });
  }
};

//login
exports.login = async (req, res) => {
  try {
    //get data from req body
    const { email, password } = req.body;
    //validation of data
    if (!email || !password) {
      //Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }
    //check user exists or not
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        //Return 401 unauthorized status code with error message
        success: false,
        user,
        message: `User is not registered with Us, Please signup to Continue`,
      });
    }
    //Generate JWT, after password match
    if (await bcrypt.compare(password, user.password)) {
      const payLoad = {
        email: user.email,
        username: user.username,
        id: user._id,
        role: user.role
      };
      const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      //save token to user document in database
      user.token = token;
      user.password = undefined;

      console.log("User Data :", user);

      //create cookie and send response
      const options = {
        expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res
        .cookie("token", token, options)
        .status(200)
        .json({
          success: true,
          token,
          message: `User Login Success`,
          userDetails: {
            username: user.username,
            access_token: user.token,
            googleAuth: user.googleAuth,
            email: email,
            id:user._id,
            image: user.image,
            role: user.role
          },
        });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password Is Incorrect`,
      });
    }
  } catch (error) {
    console.log(error);
    //Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    });
  }
};

//changePassword
exports.changePassword = async (req, res) => {
  try {
    //Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    //get oldPassword, newPassword
    const { oldPassword, newPassword } = req.body;

    //Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      //if old password does not match, return a 401 (unauthorized) error
      return res.status(401).json({
        success: false,
        message: "The Password is Incorrect",
      });
    }

    //update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    //send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        `Password Updated Successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
        passwordUpdated(updatedUserDetails.email, updatedUserDetails.firstName)
      );
      console.log("Email sent successfully................", emailResponse);
    } catch (error) {
      //if there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.log("Error Occurred While Sending Email: ", error);
      return res.status(500).json({
        success: false,
        message: "Error Occurred While Sending Email",
        error: error.message,
      });
    }

    //Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    //if there's an error updating the password, log the error and return 500 (Internal Server Error) error
    console.error("Error Occurred While Updating Password", error);
    return res.status(500).json({
      success: false,
      message: "Error Occurred While Updating Password",
      error: error.message,
    });
  }
};
