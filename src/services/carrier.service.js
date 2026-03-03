import mapToRateShipment from "../models/getRates/rateRequest.js";
import RateResponse from "../models/getRates/rateResponse.js";
import LabelRequest from "../models/createLabel/labelRequest.js";
import LabelResponse from "../models/createLabel/labelResponse.js";
import VoidRequest from "../models/voidLabel/voidRequest.js";
import VoidResponse from "../models/voidLabel/voidResponse.js";
import EODRequest from "../models/endOfDay/eodRequest.js";
import EODResponse from "../models/endOfDay/eodResponse.js";
import { callCarrierApi } from "./carrierApi.js";

export default {
  async getRates(data) {
    console.log(`[${new Date().toISOString()}] Building rate request for OrderNumber: ${data.OrderNumber || 'N/A'}`);
    const requestObj = mapToRateShipment(data);
    
    try {
      console.log(`[${new Date().toISOString()}] Calling carrier API for getRates`);

      const apiResponse = await callCarrierApi('getRates', requestObj);
      console.log(`[${new Date().toISOString()}] Carrier API response received`);
      // Assume apiResponse is an array of rates or has a 'rates' property
      const rates = !Array.isArray(apiResponse.rateshipmentresponse) && !!apiResponse.rateshipmentresponse ? [apiResponse.rateshipmentresponse] :
       (apiResponse.rateshipmentresponse ? apiResponse.rateshipmentresponse : []);
      const resp = new RateResponse(rates);
      console.log(`[${new Date().toISOString()}] Processed ${rates.length} rates`);
      return { Request: requestObj, Rates: resp.toJSON().Rates };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Carrier API error:`, error.message);
      // Fallback to sample rates on error
      const sampleRates = [
        { ServiceLevel: "GROUND", Cost: 12.75, Currency: "USD", EstimatedDeliveryDays: 3 }
      ];
      const resp = new RateResponse(sampleRates);
      console.log(`[${new Date().toISOString()}] Falling back to sample rates`);
      return { Request: request, Rates: resp.toJSON().Rates };
    }
  },

  async createLabel(data) {
    console.log(`[${new Date().toISOString()}] Building label request for OrderNumber: ${data.OrderNumber || 'N/A'}`);
    const requestObj = new LabelRequest(data);

    if (!requestObj.isValid()) {
      throw new Error("Invalid label request: missing required fields");
    }

    const request = requestObj.toJSON();

    try {
      console.log(`[${new Date().toISOString()}] Calling carrier API for createLabel`);
      const apiResponse = await callCarrierApi('createLabel', request);
      console.log(`[${new Date().toISOString()}] Carrier API response received`);
      const resp = new LabelResponse(apiResponse);
      console.log(`[${new Date().toISOString()}] Label created with tracking: ${resp.tracking}`);
      return resp.toJSON();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Carrier API error:`, error.message);
      throw error;
    }
  },

  async voidLabel(data) {
    console.log(`[${new Date().toISOString()}] Building void request for tracking: ${data.TrackingNumber || 'N/A'}`);
    const requestObj = new VoidRequest(data);

    if (!requestObj.isValid()) {
      throw new Error("Invalid void request: missing required fields");
    }

    const request = requestObj.toJSON();

    try {
      console.log(`[${new Date().toISOString()}] Calling carrier API for voidLabel`);
      const apiResponse = await callCarrierApi('voidLabel', request);
      console.log(`[${new Date().toISOString()}] Carrier API response received`);
      const resp = new VoidResponse(true, apiResponse);
      console.log(`[${new Date().toISOString()}] Label voided with tracking: ${resp.trackingNumber}`);
      return resp.toJSON();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Carrier API error:`, error.message);
      throw error;
    }
  },

  async closeDay(data) {
    console.log(`[${new Date().toISOString()}] Building EOD request for warehouse: ${data.WarehouseCode || 'N/A'}`);
    const requestObj = new EODRequest(data);

    if (!requestObj.isValid()) {
      throw new Error("Invalid EOD request: missing required fields");
    }

    const request = requestObj.toJSON();

    try {
      console.log(`[${new Date().toISOString()}] Calling carrier API for endOfDay`);
      const apiResponse = await callCarrierApi('endOfDay', request);
      console.log(`[${new Date().toISOString()}] Carrier API response received`);
      const resp = new EODResponse(apiResponse);
      console.log(`[${new Date().toISOString()}] EOD completed with report ID: ${resp.reportId}`);
      return resp.toJSON();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Carrier API error:`, error.message);
      throw error;
    }
  }
};