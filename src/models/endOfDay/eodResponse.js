export default class EODResponse {
  constructor(reportData = {}, success = true) {
    console.log(`[${new Date().toISOString()}] Constructing EODResponse for report ${reportData.reportId || 'unknown'}`);
    this.success = Boolean(success);
    this.reportId = reportData.reportId || null;
    this.reportDate = reportData.reportDate || new Date().toISOString().split('T')[0];
    this.totalShipments = reportData.totalShipments || 0;
    this.status = reportData.status || "COMPLETED";
  }

  toJSON() {
    return {
      Success: this.success,
      ReportId: this.reportId,
      ReportDate: this.reportDate,
      TotalShipments: this.totalShipments,
      Status: this.status
    };
  }

  isValid() {
    return Boolean(this.success && this.reportId);
  }
}
