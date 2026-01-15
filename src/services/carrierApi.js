import axios from "axios";

export const callCarrierApi = async (endpoint, data) => {
  try {
    console.log(`[${new Date().toISOString()}] Making POST request to ${process.env.CARRIER_BASE_URL}/${endpoint}`);
    const response = await axios.post(`${process.env.CARRIER_BASE_URL}/${endpoint}`, data, {
      headers: {
        'x-api-key': process.env.CARRIER_API_KEY,
        'x-api-secret': process.env.CARRIER_API_SECRET,
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 seconds timeout
    });
    console.log(`[${new Date().toISOString()}] Received response from ${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Carrier API error for ${endpoint}:`, error.message);
    throw error; // Re-throw to let caller handle
  }
};