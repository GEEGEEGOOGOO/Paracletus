import { parse } from 'csv-parse/sync';

/**
 * Extract and parse CSV file
 * Returns: { type: "text", text: string, meta: object }
 */
export async function extractCSV(fileBuffer, fileName) {
    try {
        console.log(`📄 Extracting CSV: ${fileName}`);

        const csvString = fileBuffer.toString('utf-8');

        // Parse CSV to records
        const records = parse(csvString, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // Convert to human-readable text
        let text = `CSV Data from ${fileName}:\n\n`;
        text += `Total Rows: ${records.length}\n\n`;

        if (records.length > 0) {
            const columns = Object.keys(records[0]);
            text += `Columns: ${columns.join(', ')}\n\n`;

            // Add sample rows (first 10)
            const sampleSize = Math.min(10, records.length);
            text += `Sample Data (first ${sampleSize} rows):\n\n`;

            for (let i = 0; i < sampleSize; i++) {
                text += `Row ${i + 1}:\n`;
                for (const col of columns) {
                    text += `  ${col}: ${records[i][col]}\n`;
                }
                text += '\n';
            }

            if (records.length > sampleSize) {
                text += `... and ${records.length - sampleSize} more rows\n`;
            }
        }

        const result = {
            type: 'text',
            text: text.trim(),
            meta: {
                rows: records.length,
                columns: records.length > 0 ? Object.keys(records[0]) : [],
                rawRecords: records
            }
        };

        console.log(`✅ CSV extracted: ${records.length} rows`);
        return result;

    } catch (error) {
        console.error(`❌ CSV extraction failed: ${error.message}`);
        throw new Error(`Failed to extract CSV: ${error.message}`);
    }
}
