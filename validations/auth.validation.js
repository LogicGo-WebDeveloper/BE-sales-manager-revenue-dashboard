import Joi from "joi";

const verifyToken = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const registerByEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    username: Joi.string(),
  }),
};

const verifyEmailOtp = {
  body: Joi.object().keys({
    otp: Joi.number().strict().required(),
    email: Joi.string().email().required(),
  }),
};

const resendEmailOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    type: Joi.string().required(),
  }),
};

const loginByEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resendForgotPasswordOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const verifyForgotPasswordOtp = {
  body: Joi.object().keys({
    otp: Joi.number().strict().required(),
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    newPassword: Joi.string().required(),
    confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};

const loginByApple = {
  body: Joi.object({
    token: Joi.string().required(),
  }),
};

const loginByGoogle = {
  body: Joi.object({
    token: Joi.string().required(),
  }),
};

const verifyMobileOtp = {
  body: Joi.object().keys({
    otp: Joi.number().strict().required(),
    mobileNumber: Joi.number().strict().required(),
  }),
};

const resendMobileOtp = {
  body: Joi.object().keys({
    mobileNumber: Joi.number().strict().required(),
    type: Joi.string().required(),
  }),
};

const registerByMobile = {
  body: Joi.object().keys({
    mobileNumber: Joi.number().strict().required(),
    password: Joi.string().required(),
  }),
};

export default {
  verifyToken,
  registerByEmail,
  loginByEmail,
  forgotPassword,
  resendEmailOtp,
  verifyEmailOtp,
  resendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  loginByGoogle,
  loginByApple,
  verifyMobileOtp,
  resendMobileOtp,
  registerByMobile,
};
