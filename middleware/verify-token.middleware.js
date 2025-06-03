import { apiResponse } from "../helper/api-response.helper.js";
import { StatusCodes } from "http-status-codes";
import helper from "../helper/common.helper.js";
import userService from "../services/user.service.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return apiResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Authorization token is required",
      });
    }

    const { userId } = await helper.verifyToken(token);

    if (!userId) {
      return apiResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        error: "Authorization token is expired or invalid",
      });
    }

    const user = await userService.findById(userId);

    if (!user?.isVerified) {
      return apiResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Please verify your email",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "Authorization token is expired or invalid",
    });
  }
};
