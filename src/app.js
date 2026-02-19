import express from "express";
import dotenv from "dotenv";
import shippingController from "./controllers/shipping.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to authenticate API Key and Secret
const authenticateApiKey = (req, res, next) => {

    console.log(req.headers);

    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
        console.log(`[${new Date().toISOString()}] Auth failed: Missing API Key or Secret`);
        return res.status(401).json({ Success: false, ErrorMessage: "API Key and Secret required" });
    }

    if (apiKey !== process.env.API_KEY || apiSecret !== process.env.API_SECRET) {
        console.log(`[${new Date().toISOString()}] Auth failed: Invalid API Key or Secret`);
        return res.status(401).json({ Success: false, ErrorMessage: "Invalid API Key or Secret" });
    }

    console.log(`[${new Date().toISOString()}] Auth successful for request to ${req.path}`);
    next();
};

app.post("/logiwa/shipping/rates", authenticateApiKey, shippingController.getRates);
// app.post("/shipping/label", shippingController.createLabel);
// app.post("/shipping/void", shippingController.voidLabel);
// app.post("/shipping/eod", shippingController.endOfDay);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Shipping API running on http://localhost:${PORT}/`));