import express from "express";
import promocodeController from "../controllers/promocode.controller.js";
import validate from "../middleware/validate.middleware.js";
import promocodeValidation from "../validations/promocode.validation.js";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { checkPermission } from "../middleware/verify-role.middleware.js";
import enumConfig from "../config/enum.config.js";

const route = express.Router();

route.post(
  "/generate",
  verifyToken,
  checkPermission([enumConfig.userRoleEnum.ADMIN]),
  validate(promocodeValidation.createPromoCodes),
  promocodeController.createPromoCodes
);

route.get(
  "/analytics",
  verifyToken,
  checkPermission([enumConfig.userRoleEnum.ADMIN]),
  promocodeController.getPromoAnalytics
);

route.get(
  "/get",
  verifyToken,
  checkPermission([enumConfig.userRoleEnum.ADMIN]),
  promocodeController.getPromoCodes
);

route.delete(
  "/bulk-delete",
  verifyToken,
  checkPermission([enumConfig.userRoleEnum.ADMIN]),
  promocodeController.deleteMultiplePromoCodes
);

route.post(
  "/apply-promo-code",
  verifyToken,
  validate(promocodeValidation.applyPromoCode),
  promocodeController.applyPromoCode
);

// route.get("/identify-user", verifyToken, promocodeController.getUserPromoCodes);

// route.get(
//   "/subscription/dates",
//   verifyToken,
//   promocodeController.getSubscriptionDates
// );

route.get(
  "/analytics-report",
  verifyToken,
  promocodeController.generateAnalyticsReport
);

// route.get("/projects", promocodeController.fetchProjectName);

export default route;
