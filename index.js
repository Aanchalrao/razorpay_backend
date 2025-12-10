import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Razorpay object
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Order API
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Payment Verification API
app.post("/verify", async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const hash = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (hash === signature) {
      return res.json({ success: true });
    }
    res.json({ success: false });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Razorpay Backend Running Successfully 🚀");
});

// Start server
app.listen(3000, () => console.log("Server Running on port 3000"));
