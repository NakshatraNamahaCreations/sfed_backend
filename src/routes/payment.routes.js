import express from "express";
import {
    createUserPaymentController,
    verifyUserPaymentController,
    failedUserPaymentController,
    webhookController
} from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/create", protect, asyncHandler(createUserPaymentController));
router.post("/verify", protect, asyncHandler(verifyUserPaymentController));
router.post("/failed", protect, asyncHandler(failedUserPaymentController));

export const paymentWebhook = [express.raw({ type: "*/*", limit: "1mb" }), asyncHandler(webhookController)];

export default router;
