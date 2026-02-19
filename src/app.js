import express from "express";
import dotenv from "dotenv";
import shippingController from "./controllers/shipping.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to authenticate API Key and Secret
const authenticateApiKey = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        console.log(`[${new Date().toISOString()}] Auth failed: Missing Authorization header`);
        return res.status(401).json({ Success: false, ErrorMessage: "Authorization required" });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");

    const [username, password] = credentials.split(":");

    if (
        username !== process.env.API_KEY ||
        password !== process.env.API_SECRET
    ) {
        console.log(`[${new Date().toISOString()}] Auth failed: Invalid credentials`);
        return res.status(401).json({ Success: false, ErrorMessage: "Invalid credentials" });
    }

    console.log(`[${new Date().toISOString()}] Auth successful`);
    next();
};

app.post("/logiwa/shipping/rates", authenticateApiKey, shippingController.getRates);
app.post("/logiwa/shipping/label", authenticateApiKey, shippingController.createLabel);
app.post("/logiwa/shipping/void", authenticateApiKey, shippingController.voidLabel);
app.post("/logiwa/shipping/eod", authenticateApiKey, shippingController.endOfDay);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Shipping API running on http://localhost:${PORT}/`));