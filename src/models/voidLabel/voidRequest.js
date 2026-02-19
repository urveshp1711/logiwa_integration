export default class VoidRequest {
  constructor(data = {}) {
    console.log(`[${new Date().toISOString()}] Constructing VoidRequest for tracking ${data.TrackingNumber || 'unknown'}`);
    
    this.trackingNumber = data.TrackingNumber || null;
    this.carrier = data.Carrier || null;
    this.reason = data.Reason || null;
  }

  toJSON() {
    return {
      trackingNumber: this.trackingNumber,
      carrier: this.carrier,
      reason: this.reason
    };
  }

  // basic validation helper
  isValid() {
    return Boolean(this.trackingNumber && this.carrier);
  }
}
