export default class EODRequest {
  constructor(data = {}) {
    console.log(`[${new Date().toISOString()}] Constructing EODRequest for warehouse ${data.WarehouseCode || 'unknown'}`);
    
    this.warehouseCode = data.WarehouseCode || null;
    this.carrier = data.Carrier || null;
    this.reportDate = data.ReportDate || new Date().toISOString().split('T')[0];
  }

  toJSON() {
    return {
      warehouseCode: this.warehouseCode,
      carrier: this.carrier,
      reportDate: this.reportDate
    };
  }

  // basic validation helper
  isValid() {
    return Boolean(this.warehouseCode && this.carrier);
  }
}
