import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../helper/api-response.helper.js";
import Payment from "../models/payment.model.js";
import mongoose from "mongoose";

const createPayment = async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user.id;
    const result = await Payment.create(data);
    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Payment addedd successfully.",
      data: result,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy = req.user.id;
    const filter = { createdBy }

    if (id) filter._id = new mongoose.Types.ObjectId(id);
    const result = await Payment.find(filter);

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Payment fetch successfully.",
      data: result,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const findId = await Payment.findById(id);
    if (!findId) {
      return apiResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        status: false,
        message: "Payment not found.",
        data: null,
      });
    }

    const result = await Payment.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Payment update successfully.",
      data: result,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const findId = await Payment.findById(id);
    if (!findId) {
      return apiResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        status: false,
        message: "Payment not found.",
        data: null,
      });
    }

    await Payment.findByIdAndDelete(id);

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Payment delete successfully.",
      data: null,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export default {
  createPayment,
  getPayment,
  updatePayment,
  deletePayment,
};
