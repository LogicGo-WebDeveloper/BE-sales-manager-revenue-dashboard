import Joi from "joi";

const createPayment = {
  body: Joi.object().keys({
    accountHolderName: Joi.string().required(),
    bankName: Joi.string().required(),
    bankAddress: Joi.string().required(),
    accountNumber: Joi.string().required(),
    ifscCode: Joi.string().required(),
    swiftBicCode: Joi.string().default(null),
    createdBy: Joi.string(),
  }),
};

const updatePayment = {
  body: Joi.object().keys({
    accountHolderName: Joi.string(),
    bankName: Joi.string(),
    bankAddress: Joi.string(),
    accountNumber: Joi.string(),
    ifscCode: Joi.string(),
    swiftBicCode: Joi.string(),
    createdBy: Joi.string(),
  }),
};

export default {
  createPayment,
  updatePayment,
};
