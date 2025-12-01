import { io } from 'socket.io-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOCKET_URL = 'http://localhost:3000';
const TEST_PDF_PATH = path.join(__dirname, 'test_doc.pdf'); // We'll create a dummy PDF

// Create a dummy PDF file for testing
fs.writeFileSync(TEST_PDF_PATH, Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World from Test Script) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000206 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n300\n%%EOF'));

console.log('🔌 Connecting to server:', SOCKET_URL);

const socket = io(SOCKET_URL, {
    auth: {
        token: 'desktop-app-token'
    }
});

socket.on('connect', () => {
    console.log('✅ Connected to server');

    // Read PDF file
    const fileBuffer = fs.readFileSync(TEST_PDF_PATH);
    const fileBase64 = fileBuffer.toString('base64');

    console.log('📤 Uploading file...');

    // Emit file:upload event (matching the app's behavior)
    socket.emit('file:upload', {
        fileData: fileBase64,
        fileName: 'test_doc.pdf',
        mimeType: 'application/pdf'
    });
});

socket.on('file:ready', (data) => {
    console.log('✅ File processed successfully!');
    console.log('   Message:', data.message);
    cleanup();
});

socket.on('file:error', (data) => {
    console.log('❌ File processing error:', data.message);
    cleanup();
});

socket.on('error', (err) => {
    console.log('❌ Socket error:', err);
});

function cleanup() {
    console.log('🧹 Cleaning up...');
    socket.disconnect();
    if (fs.existsSync(TEST_PDF_PATH)) {
        fs.unlinkSync(TEST_PDF_PATH);
    }
    process.exit(0);
}

// Timeout if no response
setTimeout(() => {
    console.log('❌ Test timed out (Backend did not respond)');
    cleanup();
}, 70000); // 70s timeout (longer than backend's 60s)
