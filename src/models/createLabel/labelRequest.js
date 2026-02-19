export default class LabelRequest {
  constructor(data = {}) {
    console.log(`[${new Date().toISOString()}] Constructing LabelRequest for ${data.OrderNumber || 'unknown order'}`);
    const shipFrom = data.ShipFrom || {};
    const shipTo = data.ShipTo || {};
    const packages = Array.isArray(data.Packages) ? data.Packages : [];

    this.account = data.WarehouseCode || null;
    this.reference = data.OrderNumber || null;
    this.serviceLevel = data.ServiceLevel || null;

    this.shipment = {
      shipper: {
        name: shipFrom.CompanyName || shipFrom.Name || null,
        address: shipFrom.Address || null,
        city: shipFrom.City || null,
        state: shipFrom.State || null,
        postalCode: shipFrom.PostalCode || null,
        country: shipFrom.Country || null,
        phone: shipFrom.Phone || null,
        email: shipFrom.Email || null
      },
      recipient: {
        name: shipTo.CompanyName || shipTo.Name || null,
        address: shipTo.Address || null,
        city: shipTo.City || null,
        state: shipTo.State || null,
        postalCode: shipTo.PostalCode || null,
        country: shipTo.Country || null,
        phone: shipTo.Phone || null,
        email: shipTo.Email || null
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
      serviceLevel: this.serviceLevel,
      shipment: this.shipment
    };
  }

  // basic validation helper
  isValid() {
    const shipper = this.shipment.shipper;
    const recipient = this.shipment.recipient;
    return Boolean(
      shipper.postalCode
      && shipper.country
      && recipient.postalCode
      && recipient.country
      && this.shipment.packages.length > 0
      && this.serviceLevel
    );
  }
}
