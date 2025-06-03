import bcrypt from "bcrypt";
import { apiResponse } from "../helper/api-response.helper.js";
import enums from "../config/enum.config.js";
import config from "../config/config.js";
import helper from "../helper/common.helper.js";
import { StatusCodes } from "http-status-codes";
import userService from "../services/user.service.js";
import emailService from "../services/email.service.js";
import jwt from "jsonwebtoken";
import admin from "../firebase/config.firebase.js";

// For verify token
const verifyToken = async (req, res) => {
  try {
    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Token is verify successfully.",
      status: true,
      data: null,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      status: false,
      data: null,
    });
  }
};

// For email registration
const registerByEmail = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    let user = await userService.findOne({ email, isDeleted: false }, true);

    const { otp, otpExpiresAt } = helper.generateOTP();
    await emailService.sendOTPEmail({ email, otp, otpExpiresAt });

    if (user) {
      if (user.isVerified) {
        return apiResponse({
          res,
          status: false,
          message: "Email ID already in use",
          statusCode: StatusCodes.BAD_REQUEST,
          data: null,
        });
      } else {
        await userService.update(user._id, { otp, otpExpiresAt });
      }
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = {
        email,
        password: hashPassword,
        provider: enums.authProviderEnum.EMAIL,
        otp,
        otpExpiresAt,
        username,
        isVerified: false,
      };

      await userService.create(newUser);
    }

    return apiResponse({
      res,
      statusCode: StatusCodes.CREATED,
      status: true,
      message:
        "Registration complete! Check your email for the verification OTP",
      data: null,
    });
  } catch (error) {
    console.log(error);

    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For mobile registration
const registerByMobile = async (req, res) => {
  try {
    const { mobileNumber, password, username } = req.body;

    let user = await userService.findOne(
      { mobileNumber, isDeleted: false },
      true
    );

    const { otp, otpExpiresAt } = helper.generateOTP();
    // await smsService.sendOTPSMS({ mobileNumber, otp });

    if (user) {
      if (!user.isVerified) {
        return apiResponse({
          res,
          status: false,
          message: "Please verify your mobile number",
          statusCode: StatusCodes.BAD_REQUEST,
          data: null,
        });
      } else {
        await userService.update(user._id, { otp, otpExpiresAt });
      }
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = {
        email: null,
        mobileNumber,
        password: hashPassword,
        provider: enums.authProviderEnum.EMAIL,
        otp,
        otpExpiresAt,
        username,
        isVerified: false,
      };

      await userService.create(newUser);
    }

    return apiResponse({
      res,
      statusCode: StatusCodes.CREATED,
      status: true,
      message: "Registration complete! Check your SMS for the verification OTP",
      data: null,
    });
  } catch (error) {
    console.log(error);

    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For verify email otp
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid email or user does not exist",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return apiResponse({
        res,
        status: false,
        message: "OTP has expired",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (user.otp !== otp) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid OTP",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (user.backupEmail != null) {
      await userService.update(
        { email, isDeleted: false },
        {
          otp: null,
          otpExpiresAt: null,
          isVerified: true,
          otpVerified: true,
          email: user.backupEmail,
          backupEmail: null,
          recoveryMethods: { isEmail: false },
        }
      );
    } else {
      await userService.update(
        { email, isDeleted: false },
        { otp: null, otpExpiresAt: null, isVerified: true, otpVerified: true }
      );
    }

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "OTP verified successfully!",
      data: null,
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);

    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For verify mobile otp
const verifyMobileOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    let user = await userService.findOne({ mobileNumber, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid mobileNumber or user does not exist",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return apiResponse({
        res,
        status: false,
        message: "OTP has expired",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (user.otp !== otp) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid OTP",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (user.backupMobileNumber != null) {
      await userService.update(
        { mobileNumber, isDeleted: false },
        {
          otp: null,
          otpExpiresAt: null,
          isVerified: true,
          otpVerified: true,
          mobileNumber: user.backupMobileNumber,
          backupMobileNumber: null,
          countryCode: user.backupCountryCode,
          backupCountryCode: null,
          recoveryMethods: { isPhone: false },
        }
      );
    } else {
      await userService.update(
        { mobileNumber, isDeleted: false },
        { otp: null, otpExpiresAt: null, isVerified: true, otpVerified: true }
      );
    }

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "OTP verified successfully!",
      data: null,
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For resend back-up mobile otp
const resendMobileOtp = async (req, res) => {
  try {
    const { type, mobileNumber } = req.body;

    if (!["mobileNumber", "backupMobileNumber"].includes(type)) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid type. Use 'mobileNumber' or 'backupMobileNumber'.",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    let user = await userService.findOne({
      [type]: mobileNumber,
      isDeleted: false,
    });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: `User with this ${type} does not exist.`,
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const { otp, otpExpiresAt } = helper.generateOTP();

    // await smsService.sendOTPSMS({ mobileNumber, otp });

    await userService.update(
      { [type]: mobileNumber, isDeleted: false },
      { otp, otpExpiresAt }
    );

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: `OTP has been resent successfully to ${type}!`,
      data: null,
    });
  } catch (error) {
    console.error("Error in resendEmailOtp:", error);
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For resend email otp
const resendEmailOtp = async (req, res) => {
  try {
    const { email, type } = req.body; // `type` can be 'email' or 'backupEmail'

    if (!type || (type !== "email" && type !== "backupEmail")) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid type. Use 'email' or 'backupEmail'",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    let user = await userService.findOne({ [type]: email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User does not exist",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const { otp, otpExpiresAt } = helper.generateOTP();

    await emailService.sendOTPEmail({ email, otp, otpExpiresAt });

    await userService.update(
      { [type]: email, isDeleted: false },
      { otp, otpExpiresAt }
    );

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: `OTP has been resent successfully to ${type}!`,
      data: null,
    });
  } catch (error) {
    console.error("Error in resendEmailOtp:", error);

    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For email login
const loginByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid email or user does not exist",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (!user.isVerified) {
      return apiResponse({
        res,
        status: false,
        message: "Please first verify OTP to activate your account",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid password",
        statusCode: StatusCodes.UNAUTHORIZED,
        data: null,
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwt.secretKey,
      {
        expiresIn: config.jwt.expiresIn || "7days",
      }
    );

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Login successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For mobile login
const loginByMobile = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    let user = await userService.findOne({ mobileNumber, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid mobile number or user does not exist",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (!user.isVerified) {
      return apiResponse({
        res,
        status: false,
        message: "Please first verify OTP to activate your account",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid password",
        statusCode: StatusCodes.UNAUTHORIZED,
        data: null,
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwt.secretKey,
      {
        expiresIn: config.jwt.expiresIn || "7days",
      }
    );

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Login successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User not found",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const { otp, otpExpiresAt } = helper.generateOTP();

    await emailService.sendOTPEmail({ email, otp });
    await userService.update(user._id, { otp, otpExpiresAt });

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "OTP sent successfully!",
      data: null,
    });
  } catch (error) {
    console.error("Error in forgotOtp:", error);

    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For reset password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User not found",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (!user.otpVerified) {
      return apiResponse({
        res,
        status: false,
        message: "Please verify OTP before resetting password",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await userService.update(
      { email },
      { password: hashPassword, otpVerified: false }
    );

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Password reset successfully!",
      data: null,
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);

    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For google login/registration
const loginByGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { email, picture, uid: providerId } = decodedToken;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      const newUser = {
        email,
        profileImage: picture ? [picture] : [],
        provider: enums.authProviderEnum.GOOGLE,
        providerId,
        isVerified: true,
      };

      user = await userService.create(newUser);
    } else {
      await userService.update(
        { email },
        {
          profileImage: picture ? [picture] : user.profileImage,
          provider: enums.authProviderEnum.GOOGLE,
          providerId,
        }
      );
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwt.secretKey,
      {
        expiresIn: config.jwt.expiresIn || "7days",
      }
    );

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Google login successful",
      data: {
        token: jwtToken,
        user,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Invalid Token or expired.",
      data: null,
    });
  }
};

// For apple login/registration
const loginByApple = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { email, uid: providerId } = decodedToken;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      const generatedEmail = email || `${providerId}@appleid.com`;

      const newUser = {
        email: generatedEmail,
        provider: enums.authProviderEnum.APPLE,
        providerId,
        isVerified: true,
      };

      user = await userService.create(newUser);
    } else {
      await userService.update(
        { email },
        {
          provider: enums.authProviderEnum.APPLE,
          providerId,
        }
      );
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwt.secretKey,
      {
        expiresIn: config.jwt.expiresIn || "7days",
      }
    );

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Apple login successful",
      data: {
        token: jwtToken,
        user,
      },
    });
  } catch (error) {
    console.error("Error during Apple login:", error);
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Invalid token or expired.",
      data: null,
    });
  }
};

export default {
  verifyToken,
  registerByEmail,
  loginByEmail,
  forgotPassword,
  verifyEmailOtp,
  verifyMobileOtp,
  resendEmailOtp,
  resendMobileOtp,
  verifyToken,
  resetPassword,
  loginByGoogle,
  loginByApple,
  registerByMobile,
  loginByMobile,
};
