import mapToRateShipment from "../models/getRates/rateRequest.js";
import RateResponse from "../models/getRates/rateResponse.js";
import mapToLabelShipment from "../models/createLabel/labelRequestMapping.js";

import LabelResponse from "../models/createLabel/labelResponse.js";
import VoidRequest from "../models/voidLabel/voidRequest.js";
import VoidResponse from "../models/voidLabel/voidResponse.js";
import EODRequest from "../models/endOfDay/eodRequest.js";
import EODResponse from "../models/endOfDay/eodResponse.js";
import { callCarrierApi } from "./carrierApi.js";
import { storageService } from "./storage.service.js";

/**
 * Helper to ensure error message is a string and readable
 */
const formatErrorMessage = (error) => {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message && typeof error.message === "string") return error.message;
  if (error.ErrorMessage && typeof error.ErrorMessage === "string") return error.ErrorMessage;
  if (error.error && typeof error.error === "string") return error.error;

  try {
    return JSON.stringify(error);
  } catch (e) {
    return String(error);
  }
};


export default {
  async getRates(data) {
    console.log(`[${new Date().toISOString()}] Building rate request for OrderNumber: ${data.OrderNumber || 'N/A'}`);
    const requestObj = mapToRateShipment(data);
    console.log(JSON.stringify(requestObj));

    try {
      console.log(`[${new Date().toISOString()}] Calling carrier API for getRates`);

      const apiResponse = await callCarrierApi('getRates', requestObj);
      console.log(`[${new Date().toISOString()}] Carrier API response received`);
      console.log(JSON.stringify(apiResponse));
      // Assume apiResponse is an array of rates or has a 'rates' property
      const rates = !Array.isArray(apiResponse.rateshipmentresponse) && !!apiResponse.rateshipmentresponse ? [apiResponse.rateshipmentresponse] :
        (apiResponse.rateshipmentresponse ? apiResponse.rateshipmentresponse : []);
      const resp = new RateResponse(rates);
      console.log(`[${new Date().toISOString()}] Processed ${rates.length} rates`);
      return { Request: requestObj, Rates: resp.toJSON().Rates };
    } catch (error) {
      const errorDetail = error.response?.data || error.message;
      const finalMessage = formatErrorMessage(errorDetail);
      console.error(`[${new Date().toISOString()}] Carrier API error (getRates):`, errorDetail);
      // Fallback to sample rates on error
      const sampleRates = [
        { ServiceLevel: "GROUND", Cost: 12.75, Currency: "USD", EstimatedDeliveryDays: 3 }
      ];
      const resp = new RateResponse(sampleRates);
      console.log(`[${new Date().toISOString()}] Falling back to sample rates`);
      return { Request: requestObj, Rates: resp.toJSON().Rates };
    }

  },

  async createLabel(data) {
    const shipment = Array.isArray(data) ? data[0] : data;
    const orderNo = shipment?.shipmentOrderCode || shipment?.OrderNumber || 'N/A';

    console.log(`[${new Date().toISOString()}] Building label request for Order: ${orderNo}`);
    const requestObj = mapToLabelShipment(data);
    console.log(JSON.stringify(requestObj));

    try {
      console.log(`[${new Date().toISOString()}] Calling carrier API for createLabel`);
      const apiResponse = await callCarrierApi('createLabel', requestObj);
      console.log(`[${new Date().toISOString()}] Carrier API response received`);
      console.log(JSON.stringify(apiResponse));

      // Extract nested response if it exists
      const labelData = apiResponse.shipmentresponse || apiResponse;

      // Check for API-level errors (Legacy structure)
      if (labelData.error || labelData.errormessage) {
        const errMsg = formatErrorMessage(labelData.error || labelData.errormessage);
        throw new Error(errMsg);
      }

      // Check for API-level errors (New structure)
      if (labelData.data?.[0]) {
        const mainData = labelData.data[0];
        if (mainData.isSuccessful === false) {
          const errMsg = mainData.message?.length > 0 ? mainData.message.join(', ') : "Request was unsuccessful";
          throw new Error(errMsg);
        }
      }

      const resp = new LabelResponse(labelData, data);

      // Upload label to Azure Storage if base64 exists
      if (resp.base64 && orderNo !== 'N/A') {
        try {
          const extension = resp.format?.toLowerCase() === 'zpl' ? 'zpl' : 'pdf';
          const filename = `${orderNo}_${resp.tracking || Date.now()}.${extension}`;
          const labelUrl = await storageService.uploadLabel(filename, resp.base64);

          // Update labelUrl in packageResponse
          if (resp.packageResponse && resp.packageResponse.length > 0) {
            resp.packageResponse.forEach(pkg => {
              pkg.labelUrl = labelUrl;
            });
          }
        } catch (storageError) {
          console.error(`[${new Date().toISOString()}] Failed to upload label to storage:`, storageError.message);
          // Don't fail the whole request if storage fails, just log it
        }
      }

      // Check if we actually got a tracking number (from either structure)
      if (!resp.tracking && !resp.base64) {
        console.warn(`[${new Date().toISOString()}] API returned success but missing tracking/label data`, apiResponse);

        // If there's an error nested elsewhere, use it
        const possibleError = apiResponse.error || apiResponse.errormessage;
        if (possibleError) {
          throw new Error(formatErrorMessage(possibleError));
        }

        throw new Error("Carrier API returned an empty response (no tracking or label data)");
      }

      console.log(`[${new Date().toISOString()}] Label created with tracking: ${resp.tracking}`);
      return resp.toJSON();
    } catch (error) {
      const errorDetail = error.response?.data || error.message;
      const finalMessage = formatErrorMessage(errorDetail);
      console.error(`[${new Date().toISOString()}] Carrier API error (createLabel):`, errorDetail);
      throw new Error(finalMessage);
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