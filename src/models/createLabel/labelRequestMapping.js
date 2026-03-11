
/**
 * Maps a shipment request to a label shipment request
 * @param {Object} dataObj
 * @returns {Object}
 */
function mapToLabelShipment(dataObj) {
    const shipment = Array.isArray(dataObj) ? dataObj[0] : dataObj;

    const shipTo = shipment.shipTo || {};
    const shipFrom = shipment.shipFrom || {};
    const shipToAddress = shipTo.address || {};
    const shipFromAddress = shipFrom.address || {};
    const shipToContact = shipTo.contact || {};
    const shipFromContact = shipFrom.contact || {};

    const packageItem = shipment.requestedPackageLineItems?.[0] || {};
    const weightObj = packageItem.weight || {};
    const dimensionsObj = packageItem.dimensions || {};

    const product = packageItem.products?.[0] || shipment.internationalOptions?.customsItems?.[0] || {};

    const now = new Date();
    const dateStr = shipment.plannedPickUpDate ? shipment.plannedPickUpDate.split('T')[0] : now.toISOString().split('T')[0];

    let uom = weightObj.Units || "LB";
    let weightValue = weightObj.Value !== undefined ? weightObj.Value : (typeof weightObj === "number" ? weightObj : 0);

    if (uom.toLowerCase() === "oz") {
        uom = "LB";
        weightValue = (Number(weightValue) / 16).toFixed(2);
    }

    return {
        shipment: {
            service: shipment.shippingOption,
            labelformat: shipment.labelSpecification?.labelFileType,
            account: "1001",
            reference: shipment.shipmentOrderCode,
            ordernumber: shipment.shipmentOrderCode,
            datetime: dateStr,
            value: shipment.shipmentOrderTotalPrice || product.declaredValue,
            currency: shipment.currency || shipment.shipmentOrderCurrencyCode,
            uom: uom,
            weight: weightValue,
            dimunit: dimensionsObj.Units,
            length: dimensionsObj.Length,
            width: dimensionsObj.Width,
            height: dimensionsObj.Height,
            shipper: {
                name: shipFromContact.companyName || shipFromContact.personName,
                addr1: `${shipFromAddress.AddressLine1 || ""} ${shipFromAddress.AddressLine2 || ""}`.trim(),
                city: shipFromAddress.City,
                state: shipFromAddress.StateOrProvinceCode,
                country: shipFromAddress.CountryCode,
                postal: shipFromAddress.PostalCode?.replace(/\s/g, ""),
                phone: shipFromContact.phoneNumber
            },
            consignee: {
                name: shipToContact.personName || shipToContact.companyName,
                addr1: `${shipToAddress.AddressLine1 || ""} ${shipToAddress.AddressLine2 || ""}`.trim(),
                city: shipToAddress.City,
                state: shipToAddress.StateOrProvinceCode,
                country: shipToAddress.CountryCode,
                postal: shipToAddress.PostalCode?.replace(/\s/g, ""),
                phone: shipToContact.phoneNumber,
                email: shipToContact.emailAddress
            },
            item: {
                itemcode: product.sku,
                description: product.description,
                qty: product.quantity,
                unit: "EA",
                value: product.declaredValue,
                hscode: product.hsTariffCode || '6110.20.00.91',
                origin: product.originCountryCode
            }
        }
    };
}

export default mapToLabelShipment;
