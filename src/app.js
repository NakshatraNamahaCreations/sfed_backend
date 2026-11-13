import express from "express";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/error.middleware.js";
import cors from "cors";

import AuthRouter from "./routes/auth.route.js";
import UserRouter from "./routes/user.route.js";
import CategoryRouter from "./routes/category.route.js";
import ProductRouter from "./routes/product.route.js";
import ProductMediaRouter from "./routes/productMedia.route.js";
import CartRouter from "./routes/cart.route.js";
import AddressRouter from "./routes/address.route.js";
import OrderRouter from "./routes/order.route.js";
import PaymentRouter, { paymentWebhook } from "./routes/payment.routes.js";
import ShippingRouter from "./routes/shipping.route.js";
import DashboardRouter from "./routes/dashbord.route.js";
import BannerRouter from "./routes/banner.route.js";
import storefrontSync from "./middleware/storefrontSync.middleware.js";
import path from "path";



const app= express();
// behind Render/Netlify proxies: makes req.protocol "https" so upload URLs are https
app.set("trust proxy", 1);
connectDB();
// Razorpay webhook needs the raw body to check its signature, so it is
// mounted before express.json()
app.post("/api/payment/webhook", ...paymentWebhook);
app.use(express.json());
app.use(cors({
    origin:true,
    credentials:true
}))

// images uploaded from the admin panel when Cloudinary is not configured
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads"), { maxAge: "7d", fallthrough: false }));

app.get("/",(req,res)=>{
    res.json({ status: "ok", service: "SEFD Blessings API" })
})
app.use("/api/auth",AuthRouter);
app.use("/api/user",UserRouter);
app.use("/api/category",storefrontSync,CategoryRouter);
app.use("/api/product",storefrontSync,ProductRouter);
app.use("/api/productMedia",storefrontSync,ProductMediaRouter);
app.use("/api/cart",CartRouter);
app.use("/api/address",AddressRouter);
app.use("/api/order",OrderRouter);
app.use("/api/payment",PaymentRouter);
app.use("/api/shipping",ShippingRouter);
app.use("/api/dashboard",DashboardRouter);
app.use("/api/Banner",storefrontSync,BannerRouter);

app.use(errorHandler);

export default app;



