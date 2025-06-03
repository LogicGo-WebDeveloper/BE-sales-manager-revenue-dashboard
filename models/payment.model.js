import mongoose from "mongoose";

const mongooseSchema = new mongoose.Schema(
  {
    accountHolderName: String,
    bankName: String,
    bankAddress: String,
    accountNumber: String,
    ifscCode: String,
    swiftBicCode: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Payment = mongoose.model("Payment", mongooseSchema);
export default Payment;
