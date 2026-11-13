import {
    createUserPaymentService,
    verifyUserPaymentService,
    markPaymentFailedService,
    handleWebhookService
} from "../services/payment.service.js";

export const createUserPaymentController = async (req, res) => {
    const result = await createUserPaymentService(req.body.orderId, req.user);
    res.status(200).json({ success: true, ...result });
};

export const verifyUserPaymentController = async (req, res) => {
    const result = await verifyUserPaymentService(req.body, req.user);
    res.status(200).json({ success: true, ...result });
};

export const failedUserPaymentController = async (req, res) => {
    await markPaymentFailedService(req.body.razorpay_order_id, req.user);
    res.status(200).json({ success: true, message: "Payment marked as failed" });
};

export const webhookController = async (req, res) => {
    const result = await handleWebhookService(req.body, req.get("x-razorpay-signature"));
    res.status(200).json(result);
};
