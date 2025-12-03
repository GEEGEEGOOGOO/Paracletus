const { desktopCapturer } = require('electron');

class ScreenCaptureManager {
    constructor() {
        this.buffer = []; // Rolling buffer of screenshots
        this.maxBufferSize = 10;
        this.captureInterval = null;
        this.intervalMs = 1500; // 1.5 seconds
        this.isCapturing = false;
    }

    /**
     * Start the continuous capture loop
     */
    startCaptureLoop() {
        if (this.isCapturing) return;

        this.isCapturing = true;
        console.log('📸 Screen Capture Loop Started');

        // Initial capture
        this.captureScreen();

        this.captureInterval = setInterval(() => {
            this.captureScreen();
        }, this.intervalMs);
    }

    /**
     * Stop the capture loop
     */
    stopCaptureLoop() {
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
        this.isCapturing = false;
        console.log('🛑 Screen Capture Loop Stopped');
    }

    /**
     * Capture the primary screen and add to buffer
     */
    async captureScreen() {
        try {
            const sources = await desktopCapturer.getSources({
                types: ['screen'],
                thumbnailSize: { width: 1920, height: 1080 } // Optimize resolution if needed
            });

            // Assume primary screen is the first one or the one named 'Entire Screen'
            // For simplicity, take the first source which is usually the main display
            const primarySource = sources[0];

            if (primarySource) {
                const image = primarySource.thumbnail.toDataURL(); // Returns 'data:image/png;base64,...'

                this.addToBuffer(image);
                // console.log(`📸 Captured screen: ${primarySource.name} (${image.length} bytes)`);
            }
        } catch (error) {
            console.error('❌ Screen capture error:', error);
        }
    }

    /**
     * Add image to rolling buffer
     */
    addToBuffer(image) {
        this.buffer.push({
            timestamp: Date.now(),
            data: image
        });

        // Keep only last N images
        if (this.buffer.length > this.maxBufferSize) {
            this.buffer.shift();
        }
    }

    /**
     * Get the latest screenshot from the buffer
     * @returns {string|null} Base64 image data or null
     */
    getLatestScreenshot() {
        if (this.buffer.length === 0) return null;
        return this.buffer[this.buffer.length - 1].data;
    }
}

module.exports = ScreenCaptureManager;
