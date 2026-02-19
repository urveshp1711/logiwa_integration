export default class LabelResponse {
  constructor(labelData = {}, success = true) {
    console.log(`[${new Date().toISOString()}] Constructing LabelResponse for tracking ${labelData.tracking || 'unknown'}`);
    this.success = Boolean(success);
    this.tracking = labelData.tracking || null;
    this.format = labelData.format || "PDF";
    this.base64 = labelData.base64 || null;
  }

  toJSON() {
    return {
      Success: this.success,
      TrackingNumber: this.tracking,
      LabelFormat: this.format,
      LabelBase64: this.base64
    };
  }

  isValid() {
    return Boolean(this.tracking && this.base64 && this.format);
  }
}
