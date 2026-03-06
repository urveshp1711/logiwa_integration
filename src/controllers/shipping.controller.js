import carrierService from "../services/carrier.service.js";

export default {
    async getRates(req, res) {
        console.log(`[${new Date().toISOString()}] getRates called with OrderNumber: ${req.body.OrderNumber || 'N/A'}`);
        console.log(`[${new Date().toISOString()}] Rates - Request body:`, req.body);
        const result = await carrierService.getRates(req.body);
        console.log(`[${new Date().toISOString()}] getRates returning ${result.Rates.length} rates`);
        res.json({ Success: true, Rates: result.Rates });
    },

    async createLabel(req, res) {
        try {
            const data = Array.isArray(req.body) ? req.body[0] : req.body;
            const orderNo = data?.shipmentOrderCode || data?.OrderNumber || 'N/A';

            console.log(`[${new Date().toISOString()}] createLabel called for Order: ${orderNo}`);
            const label = await carrierService.createLabel(req.body);

            console.log(`[${new Date().toISOString()}] createLabel returning tracking: ${label.TrackingNumber}`);
            res.json({
                Success: true,
                TrackingNumber: label.TrackingNumber,
                LabelFormat: label.LabelFormat,
                LabelBase64: label.LabelBase64
            });
        } catch (e) {
            console.log(`[${new Date().toISOString()}] createLabel error: ${e.message}`);
            res.json({
                Success: false,
                ErrorCode: "LABEL_FAILED",
                ErrorMessage: e.message
            });
        }
    },

    async voidLabel(req, res) {
        try {
            console.log(`[${new Date().toISOString()}] voidLabel called with TrackingNumber: ${req.body.TrackingNumber || 'N/A'}`);
            const result = await carrierService.voidLabel(req.body);
            console.log(`[${new Date().toISOString()}] voidLabel completed for tracking: ${result.TrackingNumber}`);
            res.json(result);
        } catch (e) {
            console.log(`[${new Date().toISOString()}] voidLabel error: ${e.message}`);
            res.json({
                Success: false,
                ErrorCode: "VOID_FAILED",
                ErrorMessage: e.message
            });
        }
    },

    async endOfDay(req, res) {
        try {
            console.log(`[${new Date().toISOString()}] endOfDay called for warehouse: ${req.body.WarehouseCode || 'N/A'}`);
            const result = await carrierService.closeDay(req.body);
            console.log(`[${new Date().toISOString()}] endOfDay completed with report ID: ${result.ReportId}`);
            res.json(result);
        } catch (e) {
            console.log(`[${new Date().toISOString()}] endOfDay error: ${e.message}`);
            res.json({
                Success: false,
                ErrorCode: "EOD_FAILED",
                ErrorMessage: e.message
            });
        }
    }
};