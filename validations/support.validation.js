import Joi from "joi";
import enums from "../config/enum.config.js";

const supportTicket = {
  body: Joi.object().keys({
    userId: Joi.string().optional().messages({
      "string.base": "User ID must be a string",
    }),

    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
      "string.base": "Email must be a string",
      "string.email": "Email must be a valid email",
    }),

    issueType: Joi.array()
      .items(Joi.string().valid(...Object.values(enums.supportTicketCategoryEnum)))
      .min(1)
      .required()
      .messages({
        "any.required": "Category is required",
        "array.base": "Category must be an array of strings",
        "array.includes": `Each category must be one of: ${Object.values(enums.supportTicketCategoryEnum).join(", ")}`,
        "array.min": "At least one category is required"
      }),

    title: Joi.string().required().messages({
      "any.required": "Title is required",
      "string.empty": "Title cannot be empty",
      "string.base": "Title must be a string",
    }),

    description: Joi.string().required().messages({
      "any.required": "Description is required",
      "string.empty": "Description cannot be empty",
      "string.base": "Description must be a string",
    }),

    affected_project: Joi.array()
      .items(Joi.string().allow("", null))
      .optional()
      .messages({
        "array.base": "Affected Project must be an array of strings",
        "array.includes": "Each project must be a string",
      }),

    affected_sdk: Joi.array()
      .items(Joi.string().valid(...Object.values(enums.supportSDKEnum)).allow("", null))
      .optional()
      .messages({
        "array.base": "Affected SDK must be an array of strings",
        "any.only": `Each SDK must be one of: ${Object.values(enums.supportSDKEnum).join(", ")}`,
      }),


    affected_userId: Joi.string().allow(null, "").optional().messages({
      "string.base": "Affected App User ID must be a string",
    }),
  }),
};

const updateSupportTicket = {
  body: Joi.object().keys({
    status: Joi.string()
      .valid(...Object.values(enums.supportTicketStatusEnum))
      .optional(),
    reply: Joi.object().keys({
      recipientEmail: Joi.string().email().optional(),
      description: Joi.string().optional(),
      replyBy: Joi.string().hex().length(24).optional(),
    }),
    resolvedBy: Joi.string().hex().length(24).optional(),
  }),
};

export default {
  supportTicket,
  updateSupportTicket
};
