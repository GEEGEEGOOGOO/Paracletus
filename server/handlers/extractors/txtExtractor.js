/**
 * Extract text from TXT file
 * Returns: { type: "text", text: string, meta: object }
 */
export async function extractTXT(fileBuffer, fileName) {
    try {
        console.log(`📄 Extracting TXT: ${fileName}`);

        const text = fileBuffer.toString('utf-8').trim();

        const result = {
            type: 'text',
            text: text,
            meta: {
                encoding: 'utf-8',
                size: fileBuffer.length
            }
        };

        console.log(`✅ TXT extracted: ${text.length} characters`);
        return result;

    } catch (error) {
        console.error(`❌ TXT extraction failed: ${error.message}`);
        throw new Error(`Failed to extract TXT: ${error.message}`);
    }
}
