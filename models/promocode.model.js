import mongoose from "mongoose";
import enumConfig from "../config/enum.config.js";

const promoCodeSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
    },
    projectName: {
      type: [String],
    },
    codes: [
      {
        code: { type: String, required: true},
        usedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        isUsed: { type: Boolean, default: false },
        isExpired: { type: Boolean, default: false },
        // subscriptionActive:   { type: Boolean, default: false },
        // subscription: {
        //   plan: { type: String },
        //   amount: { type: Number, default: 0 },
        //   status: {
        //     type: String,
        //     enum: Object.values(enumConfig.subscriptionStatusEnums),
        //     default: enumConfig.subscriptionStatusEnums.ACTIVE,
        //   },
        //   activityLog: [
        //     {
        //       status: {
        //         type: String,
        //         enum: Object.values(enumConfig.activityLogEnums),
        //       },
        //       date: { type: Date },
        //     },
        //   ],
        // },
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    expiresAt: { type: Date },
    isTrial: { type: Boolean, default: true },
    isLifetime: { type: Boolean, default: false },
    trialDays: { type: Number, default: 7 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Admin
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
export default PromoCode;
