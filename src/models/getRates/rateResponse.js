export default class RateResponse {
  constructor(rates = [], success = true) {
    console.log(`[${new Date().toISOString()}] Constructing RateResponse with ${rates.length} rates`);
    this.success = Boolean(success);
    this.rates =rates.map((r) => ({
        ServiceLevel: r.service || null,
        Cost: r.rate ? Number(r.rate) : 0,
        Currency: r.currency || null,
        EstimatedDeliveryDays: r.deliverydays != null ? Number(r.deliverydays) : null
      }));

    console.log(`[${new Date().toISOString()}] RateResponse constructed with ${this.rates.length} rates`);
  }

  toJSON() {
    return { Success: this.success, Rates: this.rates };
  }

  isValid() {
    return (
      this.rates.length > 0 &&
      this.rates.every((r) => r.ServiceLevel && typeof r.Cost === "number" && r.Currency)
    );
  }
}
