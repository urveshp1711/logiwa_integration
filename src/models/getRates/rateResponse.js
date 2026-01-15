export default class RateResponse {
  constructor(rates = [], success = true) {
    console.log(`[${new Date().toISOString()}] Constructing RateResponse with ${rates.length} rates`);
    this.success = Boolean(success);
    this.rates = Array.isArray(rates)
      ? rates.map((r) => ({
          ServiceLevel: r.ServiceLevel || null,
          Cost: Number(r.Cost || 0),
          Currency: r.Currency || null,
          EstimatedDeliveryDays: r.EstimatedDeliveryDays != null ? Number(r.EstimatedDeliveryDays) : null
        }))
      : [];
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
