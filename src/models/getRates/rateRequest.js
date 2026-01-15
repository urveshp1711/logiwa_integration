export default class RateRequest {
  constructor(data = {}) {
    console.log(`[${new Date().toISOString()}] Constructing RateRequest for ${data.OrderNumber || 'unknown order'}`);
    const shipFrom = data.ShipFrom || {};
    const shipTo = data.ShipTo || {};
    const packages = Array.isArray(data.Packages) ? data.Packages : [];

    this.account = data.WarehouseCode || null;
    this.reference = data.OrderNumber || null;

    this.shipment = {
      shipper: {
        postalCode: shipFrom.PostalCode || null,
        country: shipFrom.Country || null
      },
      recipient: {
        postalCode: shipTo.PostalCode || null,
        country: shipTo.Country || null
      },
      packageCount: packages.length,
      totalWeight: {
        value: packages.reduce((sum, p) => sum + (p.Weight || 0), 0),
        unit: "LB"
      },
      packages: packages.map((p, idx) => ({
        sequence_number: idx + 1,
        weight: {
          value: p.Weight || 0,
          unit: "LB"
        },
        dimensions: {
          length: p.Length || 0,
          width: p.Width || 0,
          height: p.Height || 0,
          unit: "IN"
        }
      }))
    };
  }

  toJSON() {
    return {
      account: this.account,
      reference: this.reference,
      shipment: this.shipment
    };
  }

  // basic validation helper
  isValid() {
    const shipper = this.shipment.shipper;
    const recipient = this.shipment.recipient;
    return Boolean(shipper.postalCode && shipper.country && recipient.postalCode && recipient.country && this.shipment.packageCount > 0);
  }
}
