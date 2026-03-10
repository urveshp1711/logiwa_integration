/**
 * Maps Logiwa shipping options to Carrier API service codes
 */
const serviceMapping = {
    "A1701": "upstwodayair"
};

/**
 * Gets the valid service code for a given shipping option
 * @param {string} shippingOption 
 * @returns {string}
 */
export const mapShippingOptionToService = (shippingOption) => {
    return serviceMapping[shippingOption] || shippingOption;
};
