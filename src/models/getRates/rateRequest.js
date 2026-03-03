// --------------------
// Type Definitions (JSDoc)
// --------------------

/**
 * @typedef {Object} Address
 * @property {string} CountryCode
 * @property {string} StateOrProvinceCode
 * @property {string} [City]
 * @property {string} PostalCode
 */

/**
 * @typedef {Object} PackageLineItem
 * @property {number} [weight]
 */

/**
 * @typedef {Object} ShipmentRequest
 * @property {string} shipmentOrderCode
 * @property {string} carrierSetupIdentifier
 * @property {Object} shipFrom
 * @property {Address} shipFrom.address
 * @property {Object} shipTo
 * @property {Address} shipTo.address
 * @property {PackageLineItem[]} [requestedPackageLineItems]
 */

/**
 * @typedef {Object} RateShipmentRequest
 * @property {Object} rateshipment
 * @property {string} rateshipment.account
 * @property {string} rateshipment.service
 * @property {string} rateshipment.iso
 * @property {string} rateshipment.province
 * @property {string} rateshipment.city
 * @property {string} rateshipment.postal
 * @property {string} rateshipment.shipperiso
 * @property {string} rateshipment.shipperprovince
 * @property {string} rateshipment.shipperpostal
 * @property {string} rateshipment.uom
 * @property {string} rateshipment.weight
 */

// --------------------
// Mapping Function
// --------------------

/**
 * Maps a shipment request to a rate shipment request
 * @param {ShipmentRequest} shipment
 * @returns {RateShipmentRequest}
 */
function mapToRateShipment(dataObj) {

  const shipment = Array.isArray(dataObj) ? dataObj[0] : dataObj;

  const shipToAddress = shipment.shipTo?.address;
  const shipFromAddress = shipment.shipFrom?.address;

  const weight =
    shipment.requestedPackageLineItems?.[0]?.weight ?? 0.16;

  return {
    rateshipment: {
      account: "1001",
      service: "canadazoneskipexpress",

      iso: shipToAddress?.CountryCode ?? "",
      province: shipToAddress?.StateOrProvinceCode ?? "",
      city: shipToAddress?.City?.trim() ?? "",
      postal: shipToAddress?.PostalCode?.replace(/\s/g, "") ?? "",

      shipperiso: shipFromAddress?.CountryCode ?? "",
      shipperprovince: shipFromAddress?.StateOrProvinceCode ?? "",
      shipperpostal: shipFromAddress?.PostalCode?.replace(/\s/g, "") ?? "",

      uom: "LB",
      weight: weight.toString()
    }
  };
}

export default mapToRateShipment;