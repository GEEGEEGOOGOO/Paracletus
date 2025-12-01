import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import extractors
import { extractPDF } from './extractors/pdfExtractor.js';
import { extractTXT } from './extractors/txtExtractor.js';
import { extractDOCX } from './extractors/docxExtractor.js';
import { extractCSV } from './extractors/csvExtractor.js';
import { extractImage } from './extractors/imageExtractor.js';

/**
 * Unified file processor
 * Returns normalized structure: { type, text?, images?, meta? }
 */
export async function processFile(fileBuffer, fileName, mimeType) {
    try {
        console.log(`📄 Processing file: ${fileName} (${mimeType})`);

        // Detect file type
        const ext = path.extname(fileName).toLowerCase();

        // Route to appropriate extractor
        if (ext === '.pdf' || mimeType === 'application/pdf') {
            return await extractPDF(fileBuffer, fileName);
        }

        if (ext === '.txt' || mimeType === 'text/plain') {
            return await extractTXT(fileBuffer, fileName);
        }

        if (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return await extractDOCX(fileBuffer, fileName);
        }

        if (ext === '.csv' || mimeType === 'text/csv') {
            return await extractCSV(fileBuffer, fileName);
        }

        if (mimeType?.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
            return await extractImage(fileBuffer, fileName, mimeType);
        }

        // Unsupported format
        throw new Error(`Unsupported file format: ${ext || mimeType}`);

    } catch (error) {
        console.error('❌ File processing error:', error.message);
        throw error;
    }
}

/**
 * Chunk large text for token limits
 */
export function chunkText(text, maxChunkSize = 30000) {
    if (text.length <= maxChunkSize) {
        return [text];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        let end = start + maxChunkSize;

        // Try to break at sentence boundary
        if (end < text.length) {
            const lastPeriod = text.lastIndexOf('. ', end);
            const lastNewline = text.lastIndexOf('\n', end);
            const breakPoint = Math.max(lastPeriod, lastNewline);

            if (breakPoint > start) {
                end = breakPoint + 1;
            }
        }

        chunks.push(text.substring(start, end));
        start = end;
    }

    return chunks;
}
