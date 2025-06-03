import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../helper/api-response.helper.js";
import PromoCode from "../models/promocode.model.js";
import crypto from "crypto";
import UserModel from "../models/user.model.js";
import fetchRevenueCatSubscription from "../services/revenuecat.service.js";
import mongoose from "mongoose";
import axios from "axios";
import enumConfig from "../config/enum.config.js";
import config from "../config/config.js";

const createPromoCodes = async (req, res) => {
    try {
        const {
            campaignName,
            projectName,
            limit,
            startDate,
            startTime,
            endDate,
            endTime,
            expiresAt,
            discountType,
            discountValue,
            isTrial,
            isLifetime,
            trialDays,
        } = req.body;

        const createdBy = req.user._id;

        if (!limit || limit <= 0) {
            return apiResponse({
                res,
                statusCode: StatusCodes.BAD_REQUEST,
                status: false,
                message: "Limit must be greater than 0",
                data: null
            });
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return apiResponse({
                res,
                statusCode: StatusCodes.BAD_REQUEST,
                status: false,
                message: "Start Date Can't Be Greater Than End Date",
                data: null
            });
        }

        const codes = [];
        for (let i = 0; i < limit; i++) {
            codes.push({
                code: crypto.randomBytes(5).toString("hex"),
                usedBy: null,
                isUsed: false,
                isExpired: false,
                // subscriptionActive: false,
            });
        }

        const promoCodeDoc = new PromoCode({
            codes,
            discountType,
            discountValue,
            startDate,
            endDate,
            campaignName,
            projectName,
            startTime,
            endTime,
            expiresAt,
            createdBy,
            isTrial,
            isLifetime,
            trialDays,
        });

        const result = await promoCodeDoc.save();

        return apiResponse({
            res,
            statusCode: StatusCodes.OK,
            status: true,
            message: "Promo codes created successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error in createPromoCodes:", error);
        return apiResponse({
            res,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: false,
            message: "Failed to create promo codes",
            data: null,
        });
    }
};

const getPromoCodes = async (req, res) => {
    try {
        const { isUsed, tag } = req.query;

        const filter = {};
        if (tag) filter.tag = tag;

        if (isUsed !== undefined) {
            filter["codes.isUsed"] = isUsed === "true";
        }

        let promoCodesQuery = PromoCode.find(filter)
            .populate("createdBy", "name email role")
            .populate("codes.usedBy", "name email role mobileNumber");

        const promoCodes = await promoCodesQuery;

        return apiResponse({
            res,
            statusCode: StatusCodes.OK,
            status: true,
            message: "Promo codes fetched successfully",
            totalCount: promoCodes.length,
            data: promoCodes,
        });
    } catch (error) {
        console.error("Error in getPromoCodes:", error);
        return apiResponse({
            res,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: false,
            message: "Failed to fetch promo codes",
            data: null,
        });
    }
};

const deleteMultiplePromoCodes = async (req, res) => {
    try {
        const { codeIds } = req.body;

        if (!Array.isArray(codeIds) || codeIds.length === 0) {
            return apiResponse({
                res,
                statusCode: StatusCodes.BAD_REQUEST,
                status: false,
                message: "Please provide an array of code _ids to delete",
                data: null,
            });
        }

        const result = await PromoCode.updateMany(
            { "codes._id": { $in: codeIds } },
            { $pull: { codes: { _id: { $in: codeIds } } } }
        );

        return apiResponse({
            res,
            statusCode: StatusCodes.OK,
            status: true,
            message: `${result.modifiedCount} promo code group(s) updated and code(s) removed successfully`,
            data: result,
        });
    } catch (error) {
        console.error("Error in deleteMultiplePromoCodes:", error);
        return apiResponse({
            res,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: false,
            message: "Failed to remove promo codes",
            data: null,
        });
    }
};

const getPromoAnalytics = async (req, res) => {
    try {
        const { promoCode, userId, adminId } = req.query;

        const matchQuery = {};

        if (adminId) matchQuery.createdBy = adminId;
        if (promoCode) matchQuery["codes.code"] = promoCode;
        if (userId) matchQuery["codes.usedBy"] = userId;

        const promos = await PromoCode.find(matchQuery)
            .populate("codes.usedBy", "name email")
            .populate("createdBy", "name email");

        const results = [];

        for (const promo of promos) {
            for (const code of promo.codes) {
                if (
                    (promoCode && code.code !== promoCode) ||
                    (userId && code.usedBy?._id.toString() !== userId)
                ) {
                    continue;
                }

                results.push({
                    promoCode: code.code,
                    isUsed: code.isUsed,
                    isExpired: code.isExpired,
                    subscriptionActive: code.subscriptionActive,
                    createdByAdmin: {
                        _id: promo.createdBy?._id,
                        name: promo.createdBy?.name,
                        email: promo.createdBy?.email,
                    },
                    usedByUser: {
                        _id: code.usedBy?._id,
                        name: code.usedBy?.name,
                        email: code.usedBy?.email,
                    },
                    subscriptionPlan: code.subscription?.plan,
                    revenueGenerated: code.subscription?.amount || 0,
                    subscriptionStatus:
                        code.subscription?.status || subscription?.status || null,
                    subscriptionTimeline: code.subscription?.activityLog || [],
                });
            }
        }

        const totalRevenue = results.reduce(
            (acc, r) => acc + r.revenueGenerated,
            0
        );

        res.status(200).json({
            totalRevenue,
            totalPromoCodes: results.length,
            filters: { promoCode, userId, adminId },
            data: results,
        });
    } catch (err) {
        console.error("Promo Analytics Error:", err);
        res
            .status(500)
            .json({ error: "Something went wrong", details: err.message });
    }
};

const applyPromoCode = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;
        const user = await UserModel.findById(userId);
        
        const promo = await PromoCode.findOne({
            "codes.code": code,
            "codes.isUsed": false,
            "codes.isExpired": false,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        });

        if (!promo) {
            return apiResponse({
                res,
                statusCode: StatusCodes.NOT_FOUND,
                status: false,
                message: "Invalid or expired promo code.",
                data: null,
            });
        }

        const promoCodeEntry = promo.codes.find((c) => c.code === code);
        if (promoCodeEntry.isUsed) {
            return apiResponse({
                res,
                statusCode: StatusCodes.FORBIDDEN,
                status: false,
                message: "Promo code has already been used",
                data: null,
            });
        }
        const now = new Date();
        if (now < promo.startDate || now > promo.endDate) {
            return apiResponse({
                res,
                statusCode: StatusCodes.FORBIDDEN,
                status: false,
                message: "Promo code is not valid for the current date",
                data: null,
            });
        }

        // const revenueData = await fetchRevenueCatSubscription(
        //     user.revenueCat.customerId
        // );

        // const entitlements = revenueData.entitlements;

        // const activeEntitlement = Object.values(entitlements).find(
        //     (e) => e.expires_date
        // );

        promoCodeEntry.usedBy = userId;
        promoCodeEntry.isUsed = true;
        // promoCodeEntry.subscriptionActive = true;
        // promoCodeEntry.subscription = {
        //     plan: activeEntitlement?.product_identifier || "Unknown",
        //     amount: 0,
        //     status: enumConfig.subscriptionStatusEnums.ACTIVE,
        //     activityLog: [
        //         {
        //             status: enumConfig.activityLogEnums.SUBSCRIBED,
        //             date: new Date(activeEntitlement?.purchase_date),
        //         },
        //     ],
        // };

        // Save promo update
        await promo.save();
        await user.save();

        return apiResponse({
            res,
            statusCode: StatusCodes.OK,
            status: true,
            message: "Promo code applied successfully.",
            data: promoCodeEntry,
        });
    } catch (err) {
        console.error("Apply Promo Error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
};

const getUserPromoCodes = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { subscriptionStatus, withAdmin } = req.query;

        // Step 1: Unwind promo codes array
        const pipeline = [
            { $unwind: "$codes" },
            { $match: { "codes.usedBy": userId } },
        ];

        // Step 2: Optional filter by subscription status
        if (subscriptionStatus) {
            pipeline.push({
                $match: { "codes.subscription.status": subscriptionStatus },
            });
        }

        // Step 3: Lookup admin info if requested
        if (withAdmin === "true") {
            pipeline.push(
                {
                    $lookup: {
                        from: "users",
                        localField: "createdBy",
                        foreignField: "_id",
                        as: "admin",
                    },
                },
                {
                    $unwind: {
                        path: "$admin",
                        preserveNullAndEmptyArrays: true,
                    },
                }
            );
        }

        // Step 4: Final projection
        pipeline.push({
            $project: {
                _id: 0,
                tag: 1,
                isTrial: 1,
                isLifetime: 1,
                trialDays: 1,
                startDate: 1,
                endDate: 1,
                expiresAt: 1,
                code: "$codes.code",
                isUsed: "$codes.isUsed",
                isExpired: "$codes.isExpired",
                subscriptionActive: "$codes.subscriptionActive",
                subscription: "$codes.subscription",
                createdByEmail: withAdmin === "true" ? "$admin.email" : null,
            },
        });

        const result = await PromoCode.aggregate(pipeline);

        if (!result.length) {
            return apiResponse({
                res,
                statusCode: StatusCodes.NOT_FOUND,
                status: false,
                message: "No promo code found for this user.",
                data: null,
            });
        }
        return apiResponse({
            res,
            statusCode: StatusCodes.OK,
            count: result.length,
            message: "Promo codes fetched successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Error fetching promo codes:", error);
        return apiResponse({
            res,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: false,
            message: "Internal server error",
            data: null,
        });
    }
};

const getSubscriptionDates = async (req, res) => {
    try {
        const userId = req.user._id;

        const promos = await PromoCode.find({
            codes: {
                $elemMatch: {
                    usedBy: userId,
                },
            },
        })
            .populate("createdBy", "email")
            .lean();

        const subscriptions = [];

        promos.forEach((promo) => {
            promo.codes.forEach((code) => {
                if (code.usedBy?.toString() === userId.toString()) {
                    const startDate =
                        code.subscription?.activityLog?.[0]?.date || promo.startDate;
                    const endDate = promo.endDate;

                    subscriptions.push({
                        code: code.code,
                        plan: code.subscription?.plan || null,
                        status: code.subscription?.status || null,
                        startDate,
                        endDate,
                    });
                }
            });
        });

        return apiResponse({
            res,
            statusCode: StatusCodes.OK,
            status: true,
            count: subscriptions.length,
            message: "Subscription start and end dates fetched successfully.",
            data: subscriptions,
        });
    } catch (error) {
        console.error("Error fetching subscription dates:", error);
        return apiResponse({
            res,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: false,
            message: "Internal server error",
            data: null,
        });
    }
};

const getRevenueCatData = async (appUserId) => {
  const url = `https://api.revenuecat.com/v1/subscribers/$RCAnonymousID:a1c88737cb424b819270f350990683f8`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer goog_WIXVJWkgdiyFnVMDcUOCfNdNDPe`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data from RevenueCat:", error);
    throw error;
  }
};

const generateAnalyticsReport = async (req, res) => {
  try {
    const appUserId = req.params.appUserId;
    const data = await getRevenueCatData(appUserId);

    const subscriber = data.subscriber;
    const entitlements = subscriber.entitlements || {};
    const subscriptions = subscriber.subscriptions || {};

    const entitlementKeys = Object.keys(entitlements);
    const subscriptionKeys = Object.keys(subscriptions);

    const entitlementDetails = entitlementKeys.map((key) => ({
      entitlementId: key,
      ...entitlements[key],
    }));

    const subscriptionDetails = subscriptionKeys.map((key) => ({
      productId: key,
      ...subscriptions[key],
    }));

    // Total revenue estimate from all active subscriptions
    let totalRevenue = 0;
    subscriptionDetails.forEach((sub) => {
      if (sub.purchase_date) {
        totalRevenue += sub.price.amount ? parseFloat(sub.price.amount) : 0;
      }
    });

    const activityTimeline = subscriptionDetails.map((sub) => ({
      productId: sub.productId,
      purchaseDate: sub.purchase_date,
      expiryDate: sub.expires_date,
      isSandbox: sub.is_sandbox,
      isActive: sub.is_active,
      unsubscribeDetectedAt: sub.unsubscribe_detected_at || null,
      billingIssuesDetectedAt: sub.billing_issues_detected_at || null,
    }));

    const report = {
      appUserId: subscriber.original_app_user_id,
      firstSeen: subscriber.first_seen,
      lastSeen: subscriber.last_seen,
      totalRevenue,
      entitlementDetails,
      subscriptionDetails,
      activityTimeline,
    };

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Analytics report generated successfully",
      data: report,
    });
  } catch (err) {
    console.error(err);
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// const fetchProjectName = async (req, res) => {
//   try {
//     const apiUrl = "https://api.revenuecat.com/v2/projects";

//     const response = await axios.get(apiUrl, {
//       headers: {
//         Authorization: `Bearer ${config.revenuecat.v2SecretKey}`,
//       },
//     });

//     return apiResponse({
//       res,
//       statusCode: StatusCodes.OK,
//       data: response,
//       message: "Projects fetch successfully.",
//     });
//   } catch (error) {
//     console.log(error);
//     return apiResponse({
//       res,
//       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//     });
//   }
// };

export default {
    createPromoCodes,
    getPromoCodes,
    deleteMultiplePromoCodes,
    applyPromoCode,
    getPromoAnalytics,
    getUserPromoCodes,
    getSubscriptionDates,
    //   getRevenueCatData,
      generateAnalyticsReport,
    //   fetchProjectName,
};
