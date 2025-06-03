import Joi from "joi";

const createPromoCodes = {
  body: Joi.object().keys({
    campaignName: Joi.string().required(),
    projectName: Joi.array().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    expiresAt: Joi.date().iso(),
    limit: Joi.number().strict().optional(),
    trialDays: Joi.number().strict().default(7),
    isTrial: Joi.boolean().default(true),
    isLifetime: Joi.boolean().default(false),
  }),
};

const applyPromoCode = {
  body: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

export default {
  createPromoCodes,
  applyPromoCode,
};
