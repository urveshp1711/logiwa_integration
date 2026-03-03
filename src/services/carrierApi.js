import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export const callCarrierApi = async (endpoint, data) => {
  try {
    const url = `${process.env.CARRIER_BASE_URL}/api`;

    const response = await axios.post(
      url,
      data,
      {
        httpsAgent,
        auth: {
          username: process.env.WizmoUser,
          password: process.env.WizmoPassword
        },
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("Carrier API error:", error.response?.data || error.message);
    throw error;
  }
};