import pdfParse from 'pdf-parse';

/**
 * Extract text from PDF
 * Returns: { type: "text", text: string, meta: object }
 */
export async function extractPDF(fileBuffer, fileName) {
    try {
        console.log(`📄 Extracting PDF: ${fileName}`);

        const data = await pdfParse(fileBuffer);

        const result = {
            type: 'text',
            text: data.text.trim(),
            meta: {
                pages: data.numpages,
                info: data.info
            }
        };

        console.log(`✅ PDF extracted: ${data.numpages} pages, ${result.text.length} characters`);
        return result;

    } catch (error) {
        console.error(`❌ PDF extraction failed: ${error.message}`);
        throw new Error(`Failed to extract PDF: ${error.message}`);
    }
}
