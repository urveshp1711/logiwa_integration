import carrierService from "../services/carrier.service.js";

export default {
    async getRates(req, res) {
        console.log(`[${new Date().toISOString()}] getRates called with OrderNumber: ${req.body.OrderNumber || 'N/A'}`);
        const result = await carrierService.getRates(req.body);
        console.log(`[${new Date().toISOString()}] getRates returning ${result.Rates.length} rates`);
        res.json({ Success: true, Rates: result.Rates });
    },

    async createLabel(req, res) {
        try {
            const label = await carrierService.createLabel(req.body);
            res.json({
                Success: true,
                TrackingNumber: label.tracking,
                LabelFormat: label.format,
                LabelBase64: label.base64
            });
        } catch (e) {
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