import mammoth from 'mammoth';

/**
 * Extract text from DOCX file
 * Returns: { type: "text", text: string, meta: object }
 */
export async function extractDOCX(fileBuffer, fileName) {
    try {
        console.log(`📄 Extracting DOCX: ${fileName}`);

        const result = await mammoth.extractRawText({ buffer: fileBuffer });

        const output = {
            type: 'text',
            text: result.value.trim(),
            meta: {
                messages: result.messages
            }
        };

        console.log(`✅ DOCX extracted: ${output.text.length} characters`);
        return output;

    } catch (error) {
        console.error(`❌ DOCX extraction failed: ${error.message}`);
        throw new Error(`Failed to extract DOCX: ${error.message}`);
    }
}
