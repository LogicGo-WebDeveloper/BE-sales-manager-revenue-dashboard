import mongoose from "mongoose";
import enums from "../config/enum.config.js";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(enums.transactionStatusEnum),
    },
    totalRevenue: {
      type: Number,
      required: true,
      default: 0,
    },
    subscription: {
      type: String,
      enum: Object.values(enums.transactionSubscriptionStatusEnums),
      required: true,
    },
    expiration: { type: Date, required: true },
    platform: {
      type: String,
      enum: Object.values(enums.platformEnum),
      required: true,
    },
    campaignCode: { type: String },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;