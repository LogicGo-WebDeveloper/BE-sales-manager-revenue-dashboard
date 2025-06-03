import express from "express";
import validate from "../middleware/validate.middleware.js";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import validation from "../validations/payment.validation.js";
import controller from "../controllers/payment.controller.js";

const route = express.Router();

route.post(
  "/",
  verifyToken,
  validate(validation.createPayment),
  controller.createPayment
);

route.get("/:id", verifyToken, controller.getPayment);
route.get("/", verifyToken, controller.getPayment);

route.patch(
  "/:id",
  verifyToken,
  validate(validation.updatePayment),
  controller.updatePayment
);

route.delete("/:id", verifyToken, controller.deletePayment);

export default route;
