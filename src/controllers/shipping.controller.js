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
            console.log(`[${new Date().toISOString()}] createLabel called with OrderNumber: ${req.body.OrderNumber || 'N/A'}`);
            console.log(`[${new Date().toISOString()}] Label - Request body:`, req.body);
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
        await carrierService.voidLabel(req.body);
        res.json({ Success: true });
    },

    async endOfDay(req, res) {
        const reportId = await carrierService.closeDay(req.body);
        res.json({ Success: true, ReportId: reportId });
    }
};