import crypto from "crypto";
import razorpay, { RAZORPAY_KEY_ID, razorpayKeySecret, WEBHOOK_SECRET, isRazorpayConfigured } from "../config/razorpay.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const fail = (message, status = 400) => Object.assign(new Error(message), { status });

const sameHex = (a, b) => {
    const x = Buffer.from(String(a || ""), "utf8");
    const y = Buffer.from(String(b || ""), "utf8");
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const hmac = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");

const ownsOrder = (order, user) => user?.role === "admin" || String(order.user) === String(user?._id);

// Marks an order paid exactly once, whether the browser (verify) or Razorpay
// (webhook) reports it first. Takes stock off for each item.
export const markOrderPaid = async (razorpayOrderId, razorpayPaymentId) => {
    const order = await Order.findOneAndUpdate(
        { razorpayOrderId, paymentStatus: { $ne: "PAID" } },
        { $set: { paymentStatus: "PAID", razorpayPaymentId, paidAt: new Date() } },
        { new: true }
    );
    if (!order) return Order.findOne({ razorpayOrderId }); // already handled

    const notes = [];
    if (order.status === "PENDING_PAYMENT") {
        order.status = "CONFIRMED";
    } else {
        notes.push(`Payment received while order was ${order.status} — check and refund if needed.`);
    }

    for (const item of order.items) {
        const updated = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
        );
        if (!updated) notes.push(`Not enough stock for ${item.name} (${item.quantity} ordered).`);
    }

    if (notes.length) order.paymentNote = notes.join(" ");
    await order.save();
    return order;
};

export const createUserPaymentService = async (orderId, user) => {
    const order = await Order.findById(orderId);
    if (!order || !ownsOrder(order, user)) throw fail("Order not found", 404);
    if (order.paymentStatus === "PAID") throw fail("This order is already paid");
    if (order.status !== "PENDING_PAYMENT") throw fail("This order can no longer be paid");
    if (!order.total || order.total <= 0) throw fail("Invalid order amount");

    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product || product.isActive === false) throw fail(`${item.name} is no longer available`);
        if (product.stock < item.quantity) throw fail(`Only ${product.stock} left of ${product.name}`);
    }

    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.total * 100), // paise
        currency: "INR",
        receipt: order._id.toString(),
        notes: { orderId: order._id.toString() },
    });

    order.razorpayOrderId = razorpayOrder.id;
    if (order.paymentStatus === "FAILED") order.paymentStatus = "UNPAID"; // retry
    await order.save();

    return {
        message: "Razorpay order created successfully",
        data: { razorpayOrder, keyId: RAZORPAY_KEY_ID() },
    };
};

export const verifyUserPaymentService = async (
    { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    user
) => {
    if (!isRazorpayConfigured()) throw fail("Online payments aren't set up yet", 503);
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) throw fail("Incomplete payment details");

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order || !ownsOrder(order, user)) throw fail("Order not found", 404);

    const expected = hmac(razorpayKeySecret(), `${razorpay_order_id}|${razorpay_payment_id}`);
    if (!sameHex(expected, razorpay_signature)) throw fail("Payment could not be verified");

    const paid = await markOrderPaid(razorpay_order_id, razorpay_payment_id);
    return { message: "Payment verified successfully", data: { order: paid } };
};

export const markPaymentFailedService = async (razorpayOrderId, user) => {
    const order = await Order.findOne({ razorpayOrderId });
    if (!order || (user && !ownsOrder(order, user))) return;
    if (order.paymentStatus === "UNPAID") {
        order.paymentStatus = "FAILED";
        await order.save();
    }
};

// Razorpay -> POST /api/payment/webhook. Safety net for when the customer
// pays but closes the tab before the browser reports back.
export const handleWebhookService = async (rawBody, signature) => {
    const secret = WEBHOOK_SECRET();
    if (!secret) throw fail("Webhook secret not configured", 503);
    if (!sameHex(hmac(secret, rawBody), signature)) throw fail("Invalid webhook signature", 401);

    const event = JSON.parse(rawBody.toString("utf8"));
    const payment = event.payload?.payment?.entity;

    if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.order_id) {
        await markOrderPaid(payment.order_id, payment.id);
    } else if (event.event === "payment.failed" && payment?.order_id) {
        await markPaymentFailedService(payment.order_id);
    }
    return { received: true };
};
