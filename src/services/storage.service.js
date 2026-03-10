import { BlobServiceClient } from "@azure/storage-blob";
import mime from "mime-types";

/**
 * Service to handle Azure Blob Storage operations
 */
export const storageService = {
    /**
     * Uploads base64 label content to Azure Blob Storage
     * @param {string} filename - The name of the file to save
     * @param {string} base64Content - The base64 encoded content
     * @param {boolean} overwriteIfExists - Whether to overwrite if file exists
     * @returns {Promise<string>} - The URL of the uploaded blob
     */
    async uploadLabel(filename, base64Content, overwriteIfExists = true) {
        if (!filename) throw new Error("Filename is required");
        if (!base64Content) throw new Error("Content is required");

        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        let containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "wizmo";

        if (!connectionString) {
            console.error("AZURE_STORAGE_CONNECTION_STRING is not defined in environment variables");
            // For now, return a placeholder to avoid breaking the flow if not configured
            return "URL_NOT_CONFIGURED";
        }

        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

            // Implement path logic similar to C# example
            // Assuming filename like "order_123.pdf"
            // Resulting path: yyyy-mm-dd/order_123.pdf
            const dateStr = new Date().toISOString().split('T')[0];
            const blobPath = `shipment/labels/logiwa/${dateStr}/${filename}`;

            const containerClient = blobServiceClient.getContainerClient(containerName);

            // Create container if it doesn't exist
            await containerClient.createIfNotExists();

            const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
            const exists = await blockBlobClient.exists();

            if (exists && !overwriteIfExists) {
                return blockBlobClient.url;
            }

            const buffer = Buffer.from(base64Content, 'base64');
            const contentType = mime.lookup(filename) || 'application/pdf';

            await blockBlobClient.uploadData(buffer, {
                blobHTTPHeaders: {
                    blobContentType: contentType
                }
            });

            console.log(`[Storage] Uploaded label to: ${blockBlobClient.url}`);
            return blockBlobClient.url;
        } catch (error) {
            console.error("[Storage] Error uploading to Azure Blob Storage:", error.message);
            throw error;
        }
    }
};
