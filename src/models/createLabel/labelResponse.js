export default class LabelResponse {
  constructor(labelData = {}) {
    this.tracking = labelData.tracknbr || labelData.tracking || null;
    this.format = labelData.labelformat || labelData.format || "PDF";
    this.base64 = labelData.label || labelData.base64 || labelData.labelbase64 || null;

    console.log(`[${new Date().toISOString()}] Constructing LabelResponse for tracking ${this.tracking || 'unknown'}`);

    // Determine success based on whether we actually got the essential data
    this.success = !!(this.tracking && this.base64);

    const rawError = labelData.error || labelData.errormessage || null;
    this.errorMessage = typeof rawError === 'object' ? JSON.stringify(rawError) : rawError;
  }


  toJSON() {
    return {
      Success: this.success,
      TrackingNumber: this.tracking,
      LabelFormat: this.format,
      LabelBase64: this.base64,
      ErrorMessage: this.errorMessage
    };
  }

  isValid() {
    return Boolean(this.success && this.tracking && this.base64);
  }
}
