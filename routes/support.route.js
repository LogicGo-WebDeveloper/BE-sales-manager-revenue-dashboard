import express from 'express';
import validate from '../middleware/validate.middleware.js';
import supportController from '../controllers/support.controller.js';
import supportValidation from '../validations/support.validation.js';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import enumConfig from '../config/enum.config.js';
import { checkPermission } from '../middleware/verify-role.middleware.js';

const route = express.Router();

route.post(
    '/',
    verifyToken,
    validate(supportValidation.supportTicket),
    supportController.createSupportTicket
);

route.get(
    '/list',
    verifyToken,
    supportController.getSupportTicket
)

route.get(
    '/list/:id',
    verifyToken,
    supportController.getSupportTicket
)

route.delete(
    '/:id',
    verifyToken,
    supportController.deleteSupportTicket
)

route.patch(
    "/:id/:status",
    verifyToken,
    checkPermission([
        enumConfig.userRoleEnum.ADMIN,
        enumConfig.userRoleEnum.MANAGER,
    ]),
    validate(supportValidation.updateSupportTicket),
    supportController.replyTicket
);

route.delete(
    "/:ticketId/:replyId",
    verifyToken,
    checkPermission([
        enumConfig.userRoleEnum.ADMIN,
        enumConfig.userRoleEnum.MANAGER,
    ]),
    supportController.deleteReplyFromTicket
);

export default route