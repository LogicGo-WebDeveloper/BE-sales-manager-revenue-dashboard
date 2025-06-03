import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../helper/api-response.helper.js";
import Transaction from "../models/transactions.model.js";
import enums from "../config/enum.config.js";
import config from "../config/config.js";
import nodemailer from "nodemailer";
import helper from "../helper/common.helper.js";
import moment from "moment";
import revenueCatService from "../services/revenuecat.service.js";

// From revenue cat webhook
// uncomment this when revenue cat webhook is working
// const handleRevenueCatWebhook = async (req, res) => {
//   try {
//     const webhookData = req.body;

//     // Validate webhook data
//     if (!webhookData || !webhookData.event || !webhookData.event.user_id) {
//       return apiResponse({
//         res,
//         status: false,
//         message: "Invalid webhook data.",
//         statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//       });
//     }

//     // Create transaction object
//     const transactionData = {
//       userId: webhookData.event.app_user_id,
//       project: webhookData.event.product_id || "default",
//       status:
//         webhookData.event.type === "INITIAL_PURCHASE"
//           ? enums.transactionStatusEnum.PURCHASED
//           : webhookData.event.type === "RENEWAL"
//           ? enums.transactionStatusEnum.RENEWAL
//           : webhookData.event.type === "NON_RENEWING_PURCHASE"
//           ? enums.transactionStatusEnum.LIFETIME
//           : webhookData.event.type === "CANCELLATION"
//           ? enums.transactionStatusEnum.CANCELLED
//           : enums.transactionStatusEnum.PURCHASED,
//       totalRevenue: webhookData.event.price || 0,
//       subscription: revenueCatService.mapRevenueCatProductToSubscription(webhookData.event.product_id),
//       expiration: event.expiration_at_ms
//       ? new Date(event.expiration_at_ms)
//       : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       platform: webhookData.event.store || "unknown",
//       campaignCode: ,
//     };

//     // Save transaction to database
//     const transaction = await Transaction.create(transactionData);

//     return apiResponse({
//       res,
//       status: true,
//       message: "Transaction created successfully!",
//       data: transaction,
//       statusCode: StatusCodes.OK,
//     });
//   } catch (error) {
//     console.error("Error creating transaction:", error);
//     return apiResponse({
//       res,
//       status: false,
//       message: "Failed to create transaction.",
//       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//     });
//   }
// };

// For create transaction locally
const createTransaction = async (req, res) => {
  try {
    const {
      userId,
      project,
      status,
      totalRevenue,
      subscription,
      expiration,
      platform,
      campaignCode,
    } = req.body;

    const transaction = await Transaction.create({
      userId,
      project,
      status,
      totalRevenue,
      subscription,
      expiration,
      platform,
      campaignCode,
    });

    return apiResponse({
      res,
      status: true,
      message: "Transaction created successfully.",
      data: transaction,
      statusCode: StatusCodes.CREATED,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    return apiResponse({
      res,
      status: false,
      message: "Failed to create transaction.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const {
      userId,
      status,
      platform,
      project,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    if (project) filter.project = project;

    console.log("Filter:", filter)

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const transactions = await Transaction.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    return apiResponse({
      res,
      status: true,
      message: "Transactions fetched successfully.",
      data: {
        total,
        page: Number(page),
        limit: Number(limit),
        results: transactions,
      },
      statusCode: StatusCodes.OK,
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return apiResponse({
      res,
      status: false,
      message: "Failed to fetch transactions.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export default {
//   handleRevenueCatWebhook,
  getTransactions,
  createTransaction,
};
