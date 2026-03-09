export default class LabelResponse {
  constructor(labelData = {}, requestData = {}) {
    const shipment = Array.isArray(requestData) ? requestData[0] : requestData;

    // Store request-derived fields
    this.shipmentOrderIdentifier = shipment?.shipmentOrderIdentifier || null;
    this.shipmentOrderCode = shipment?.shipmentOrderCode || null;
    this.carrier = shipment?.carrier || null;
    this.shippingOption = shipment?.shippingOption || null;

    // Check for the new nested structure from carrier
    if (labelData.data && Array.isArray(labelData.data) && labelData.data.length > 0) {
      const mainData = labelData.data[0];
      const packageInfo = mainData.packageResponse?.[0] || {};

      this.tracking = packageInfo.trackingNumber || mainData.masterTrackingNumber;
      this.format = "PDF";
      this.base64 = packageInfo.encodedLabel || null;
      this.success = mainData.isSuccessful === true;

      this.packageResponse = mainData.packageResponse || [];
      this.rateDetail = mainData.rateDetail || {
        totalCost: 0,
        shippingCost: 0,
        otherCost: 0,
        currency: "USD"
      };
      this.masterTrackingNumber = mainData.masterTrackingNumber || this.tracking;
      this.message = mainData.message || [];
      this.errorMessage = this.message.length > 0 ? this.message.join(', ') : null;
    } else {
      // Legacy/Fallback mapping
      this.tracking = labelData.tracknbr || labelData.tracking || null;
      this.format = labelData.labelformat || labelData.format || "PDF";
      this.base64 = labelData.label || labelData.base64 || labelData.labelbase64 || null;
      this.success = !!(this.tracking && this.base64);

      this.packageResponse = [{
        packageSequenceNumber: 0,
        trackingNumber: this.tracking,
        trackingUrl: null,
        labelUrl: null,
        encodedLabel: this.base64
      }];
      this.rateDetail = {
        totalCost: 0,
        shippingCost: 0,
        otherCost: 0,
        currency: "USD"
      };
      this.masterTrackingNumber = this.tracking;

      const rawError = labelData.error || labelData.errormessage || null;
      this.message = rawError ? [typeof rawError === 'object' ? JSON.stringify(rawError) : rawError] : [];
      this.errorMessage = this.message.length > 0 ? this.message[0] : null;
    }

    console.log(`[${new Date().toISOString()}] Constructing LabelResponse for tracking ${this.tracking || 'unknown'}`);
  }


  toJSON() {
    return {
      data: [
        {
          shipmentOrderIdentifier: this.shipmentOrderIdentifier,
          shipmentOrderCode: this.shipmentOrderCode,
          carrier: this.carrier,
          shippingOption: this.shippingOption,
          packageResponse: this.packageResponse,
          rateDetail: this.rateDetail,
          masterTrackingNumber: this.masterTrackingNumber,
          isSuccessful: this.success,
          message: this.message
        }
      ],
      // Keep legacy fields at top level for backward compatibility if needed, 
      // but the main data is in the 'data' array now.
      Success: this.success,
      TrackingNumber: this.tracking,
      LabelFormat: this.format,
      LabelBase64: this.base64,
      ErrorMessage: this.errorMessage
    };
  }

  isValid() {
    return Boolean(this.success && this.tracking);
  }
}
