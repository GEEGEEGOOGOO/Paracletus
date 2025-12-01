/**
 * Extract image data
 * Returns: { type: "image", images: [{base64, mimetype}], meta: object }
 */
export async function extractImage(fileBuffer, fileName, mimeType) {
    try {
        console.log(`🖼️ Extracting image: ${fileName}`);

        const base64 = fileBuffer.toString('base64');

        const result = {
            type: 'image',
            images: [{
                base64: base64,
                mimetype: mimeType
            }],
            meta: {
                size: fileBuffer.length,
                fileName: fileName
            }
        };

        console.log(`✅ Image extracted: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
        return result;

    } catch (error) {
        console.error(`❌ Image extraction failed: ${error.message}`);
        throw new Error(`Failed to extract image: ${error.message}`);
    }
}
