export default class VoidResponse {
  constructor(success = true, data = {}) {
    console.log(`[${new Date().toISOString()}] Constructing VoidResponse for tracking ${data.trackingNumber || 'unknown'}`);
    this.success = Boolean(success);
    this.trackingNumber = data.trackingNumber || null;
    this.voidedAt = data.voidedAt || new Date().toISOString();
    this.status = data.status || "VOIDED";
  }

  toJSON() {
    return {
      Success: this.success,
      TrackingNumber: this.trackingNumber,
      VoidedAt: this.voidedAt,
      Status: this.status
    };
  }

  isValid() {
    return Boolean(this.success && this.trackingNumber);
  }
}
