import express from 'express';
import validate from '../middleware/validate.middleware.js';
import transactionController from '../controllers/transactions.controller.js';
import { verifyToken } from '../middleware/verify-token.middleware.js';
import enumConfig from '../config/enum.config.js';
import { checkPermission } from '../middleware/verify-role.middleware.js';

const route = express.Router();


route.post(
    '/webhook',
    transactionController.createTransaction
)

route.get(
    '/',
    verifyToken,
    transactionController.getTransactions
);


export default route;