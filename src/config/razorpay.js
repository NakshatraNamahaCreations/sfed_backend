import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const real = (v) => {
    const s = (v || "").trim();
    return s && !/placeholder|your_|xxx/i.test(s) ? s : "";
};

export const RAZORPAY_KEY_ID = () => real(process.env.RAZORPAY_KEY_ID);
const KEY_SECRET = () => real(process.env.RAZORPAY_KEY_SECRET);
export const WEBHOOK_SECRET = () => real(process.env.RAZORPAY_WEBHOOK_SECRET);

export const isRazorpayConfigured = () => Boolean(RAZORPAY_KEY_ID() && KEY_SECRET());
export const razorpayKeySecret = KEY_SECRET;

let client = null;

// Created on first use so the API still starts (shop, admin, uploads) while
// keys aren't filled in yet — only paying needs them.
export const getRazorpay = () => {
    if (!isRazorpayConfigured()) {
        const err = new Error("Online payments aren't set up yet. Please try again later.");
        err.status = 503;
        throw err;
    }
    if (!client) client = new Razorpay({ key_id: RAZORPAY_KEY_ID(), key_secret: KEY_SECRET() });
    return client;
};

export default { orders: { create: (...a) => getRazorpay().orders.create(...a) } };
