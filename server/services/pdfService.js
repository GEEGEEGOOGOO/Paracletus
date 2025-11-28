import { createRequire } from 'module';
import logger from '../logger.js';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

/**
 * Extract text from PDF buffer
 * @param {Buffer} pdfBuffer - PDF file as buffer
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromPDF = async (pdfBuffer) => {
    try {
        logger.info('📄 Extracting text from PDF...');

        const data = await pdfParse(pdfBuffer);

        const text = data.text.trim();
        const pageCount = data.numpages;

        logger.info(`✅ PDF text extracted: ${pageCount} pages, ${text.length} characters`);

        if (!text || text.length === 0) {
            throw new Error('PDF appears to be empty or contains no extractable text');
        }

        return text;

    } catch (error) {
        logger.error('❌ PDF extraction failed:', error.message);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};

export default {
    extractTextFromPDF
};
