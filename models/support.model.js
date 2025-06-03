import mongoose from "mongoose";
import enums from "../config/enum.config.js";

const supportTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    email: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    issueType: {
        type: [String],
        enum: Object.values(enums.supportTicketCategoryEnum),
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    affected_project: {
        type: [String],
        default: null,
    },
    affected_sdk: {
        type: [String],
        enum: Object.values(enums.supportSDKEnum),
        default: null,
    },
    affected_userId: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: Object.values(enums.supportTicketStatusEnum),
        default: enums.supportTicketStatusEnum.OPEN,
    },
    reply: [
        {
            recipientEmail: {
                type: String,
                required: false
            },
            description: {
                type: String,
                required: false
            },
            replyBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
        }
    ],
    resolvedBy: {
        // Admin
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},
    { timestamps: true }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;