import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../helper/api-response.helper.js";
import SupportModel from '../models/support.model.js';
import enums from '../config/enum.config.js';
import config from "../config/config.js";
import nodemailer from "nodemailer";
import helper from "../helper/common.helper.js";
import moment from "moment";

const createSupportTicket = async (req, res) => {
    try {
        const {
            email,
            issueType,
            title,
            description,
            affected_project,
            affected_sdk,
            affected_userId,
        } = req.body;
        const userId = req.user.id;

        const supportRequest = new SupportModel({
            userId,
            email,
            title,
            issueType,
            description,
            affected_project,
            affected_sdk,
            affected_userId,
        });

        await supportRequest.save();

        // Nodemailer email setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.nodemailer.supportEmail,
                pass: config.nodemailer.supportPassword,
            },
        });

        const mailOptions = {
            from: config.nodemailer.supportEmail,
            replyTo: email,
            to: config.nodemailer.supportEmail,
            subject: `[Support Ticket] ${title}`,
            text: `
                Issue Type: ${issueType}
                Email: ${email}
                Description: ${description}

                Affected Project: ${affected_project || "N/A"}
                Affected SDK: ${affected_sdk || "N/A"}
                Affected App User ID(s): ${affected_userId || "N/A"}
            `,
        };

        await transporter.sendMail(mailOptions);

        return apiResponse({
            res,
            status: true,
            message: "Support ticket created successfully!",
            statusCode: StatusCodes.OK,
        });
    } catch (error) {
        console.error("Support ticket error:", error);
        return apiResponse({
            res,
            status: false,
            message: "Failed to submit support ticket.",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
};

const getSupportTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, search, dateRange, page = 1, limit = 10 } = req.query;
        const userId = req.user.id;

        const filter = { userId };

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (dateRange === "month") {
            filter.createdAt = {
              $gte: moment().startOf("month").toDate(),
              $lte: moment().endOf("month").toDate(),
            };
          } else if (dateRange === "week") {
            filter.createdAt = {
              $gte: moment().startOf("week").toDate(),
              $lte: moment().endOf("week").toDate(),
            };
          } else if (dateRange === "year") {
            filter.createdAt = {
              $gte: moment().startOf("year").toDate(),
              $lte: moment().endOf("year").toDate(),
            };
          }

        if (id) {
            const ticket = await SupportModel.findOne({ _id: id, ...filter }).populate("reply.replyBy", "username email");

            if (!ticket) {
                return apiResponse({
                    res,
                    status: false,
                    message: "Support ticket not found.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            return apiResponse({
                res,
                status: true,
                message: "Support ticket fetched successfully.",
                statusCode: StatusCodes.OK,
                data: ticket,
            });
        } else {
            const { skip, limit: parsedLimit } = helper.paginationFun({ page, limit });

            const totalItems = await SupportModel.countDocuments(filter);
            const supportRequests = await SupportModel.find(filter)
                .populate("reply.replyBy", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parsedLimit);

            return apiResponse({
                res,
                status: true,
                message: "Support requests fetched successfully.",
                statusCode: StatusCodes.OK,
                data: supportRequests,
                pagination: helper.paginationDetails({ page, totalItems, limit: parsedLimit }),
            });
        }
    } catch (error) {
        console.error("Get support ticket error:", error);
        return apiResponse({
            res,
            status: false,
            message: "Failed to fetch support tickets.",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
};

const deleteSupportTicket = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await SupportModel.findById(id);

        if (!ticket) {
            return apiResponse({
                res,
                status: false,
                message: "Support ticket not found.",
                statusCode: StatusCodes.NOT_FOUND,
            });
        }

        if (ticket.status !== enums.supportTicketStatusEnum.RESOLVED) {
            return apiResponse({
                res,
                status: false,
                message: "Only resolved tickets can be deleted.",
                statusCode: StatusCodes.BAD_REQUEST,
            });
        }

        await SupportModel.findByIdAndDelete(id);

        return apiResponse({
            res,
            status: true,
            message: "Support ticket deleted successfully.",
            statusCode: StatusCodes.OK,
        });
    } catch (error) {
        console.error("Delete ticket error:", error);
        return apiResponse({
            res,
            status: false,
            message: "Failed to delete support ticket.",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
};

const replyTicket = async (req, res) => {
    try {
        const { id, status } = req.params;
        const data = req.body;
        let message = "";
        const update = {};

        const findTicket = await SupportModel.findById(id);
        if (!findTicket) {
            return apiResponse({
                res,
                statusCode: StatusCodes.NOT_FOUND,
                status: false,
                message: "Ticket not found.",
            });
        }

        if (status === "status" && data.status === enums.supportTicketStatusEnum.RESOLVED) {
            update.status = data.status;
            update.resolvedBy = req.user.id;
            message = "Ticket resolved successfully.";
        }

        if (status === "reply") {
            const replyObj = {
                recipientEmail: data.reply.recipientEmail,
                description: data.reply.description,
                replyBy: req.user.id,
                // createdAt: Date.now
            };
            update.$push = { reply: replyObj };
            message = "Ticket replied successfully.";
        }

        const result = await SupportModel.findByIdAndUpdate(id, update, { new: true });

        return apiResponse({
            res,
            statusCode: StatusCodes.OK,
            status: true,
            data: result,
            message: message
        });

    } catch (error) {
        console.log(error);
        return apiResponse({
            res,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: false,
            message: "Internal server error",
            data: null,
        });
    }
};

const deleteReplyFromTicket = async (req, res) => {
    try {
        const { ticketId, replyId } = req.params;
        const userId = req.user.id;

        const ticket = await SupportModel.findById(ticketId);

        if (!ticket) {
            return apiResponse({
                res,
                status: false,
                statusCode: StatusCodes.NOT_FOUND,
                message: "Support ticket not found.",
            });
        }

        const reply = ticket.reply.find(r => r._id.toString() === replyId);

        if (!reply) {
            return apiResponse({
                res,
                status: false,
                statusCode: StatusCodes.NOT_FOUND,
                message: "Reply not found.",
            });
        }

        if (reply.replyBy.toString() !== userId) {
            return apiResponse({
                res,
                status: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "You are not authorized to delete this reply.",
            });
        }

        await SupportModel.findByIdAndUpdate(ticketId, {
            $pull: { reply: { _id: replyId } },
        });

        return apiResponse({
            res,
            status: true,
            statusCode: StatusCodes.OK,
            message: "Reply deleted successfully.",
        });

    } catch (error) {
        console.error("Delete reply error:", error);
        return apiResponse({
            res,
            status: false,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to delete reply.",
        });
    }
};


export default {
    createSupportTicket,
    getSupportTicket,
    deleteSupportTicket,
    replyTicket,
    deleteReplyFromTicket
}