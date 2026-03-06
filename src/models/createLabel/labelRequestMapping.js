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

    return {
        shipment: {
            service: shipment.shippingOption || "upstwodayair",
            labelformat: shipment.labelSpecification?.labelFileType || "ZPL",
            account: "1001",
            reference: shipment.shipmentOrderCode || "",
            ordernumber: shipment.shipmentOrderCode || "",
            datetime: dateStr,
            value: shipment.shipmentOrderTotalPrice || product.declaredValue || 0,
            currency: shipment.currency || shipment.shipmentOrderCurrencyCode || "USD",
            uom: weightObj.Units || "LB",
            weight: weightObj.Value || 0,
            dimunit: dimensionsObj.Units || "IN",
            length: dimensionsObj.Length || 0,
            width: dimensionsObj.Width || 0,
            height: dimensionsObj.Height || 0,
            shipper: {
                name: shipFromContact.companyName || shipFromContact.personName || "BEIS C/O METRO",
                addr1: `${shipFromAddress.AddressLine1 || ""} ${shipFromAddress.AddressLine2 || ""}`.trim() || "1575 Rail Southern Court",
                city: shipFromAddress.City || "Columbus",
                state: shipFromAddress.StateOrProvinceCode || "OH",
                country: shipFromAddress.CountryCode || "US",
                postal: shipFromAddress.PostalCode?.replace(/\s/g, "") || "43217",
                phone: shipFromContact.phoneNumber || "1111111111"
            },
            consignee: {
                name: shipToContact.personName || shipToContact.companyName || "Test Test",
                addr1: `${shipToAddress.AddressLine1 || ""} ${shipToAddress.AddressLine2 || ""}`.trim() || "8374 nw 64th street",
                city: shipToAddress.City || "MIAMI",
                state: shipToAddress.StateOrProvinceCode || "FL",
                country: shipToAddress.CountryCode || "US",
                postal: shipToAddress.PostalCode?.replace(/\s/g, "") || "33166-2865",
                phone: shipToContact.phoneNumber || "1111111111",
                email: shipToContact.emailAddress || ""
            },
            item: {
                itemcode: product.sku || "BEIS123361",
                description: product.description || "The Weekender in Black",
                qty: product.quantity || 1,
                unit: "EA",
                value: product.declaredValue || 0,
                hscode: product.hsTariffCode || "4209.92.3131",
                origin: product.originCountryCode || "US"
            }
        }
    };
}

export default mapToLabelShipment;
