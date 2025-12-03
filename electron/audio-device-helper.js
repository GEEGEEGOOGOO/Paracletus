// Audio Device Helper
// Detects and guides user through VB-Audio Cable setup

class AudioDeviceHelper {
    constructor() {
        this.hasVBCable = false;
        this.devices = { input: [], output: [] };
    }

    // Detect available audio devices
    async detectDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();

            this.devices.input = devices.filter(d => d.kind === 'audioinput');
            this.devices.output = devices.filter(d => d.kind === 'audiooutput');

            // Check for VB-Cable
            this.hasVBCable = this.devices.input.some(d =>
                d.label.toLowerCase().includes('cable') ||
                d.label.toLowerCase().includes('vb-audio')
            );

            console.log('📊 Audio Devices Detected:');
            console.log('  Input devices:', this.devices.input.length);
            console.log('  Output devices:', this.devices.output.length);
            console.log('  VB-Cable detected:', this.hasVBCable);

            return {
                hasVBCable: this.hasVBCable,
                devices: this.devices
            };
        } catch (error) {
            console.error('❌ Failed to enumerate devices:', error);
            return { hasVBCable: false, devices: { input: [], output: [] } };
        }
    }

    // Get VB-Cable device
    getVBCableDevice() {
        return this.devices.input.find(d =>
            d.label.toLowerCase().includes('cable output') ||
            d.label.toLowerCase().includes('vb-audio')
        );
    }

    // Show setup instructions modal
    showSetupModal() {
        const modal = document.createElement('div');
        modal.id = 'vb-cable-modal';
        modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(8px);
    `;

        modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        padding: 32px;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <h2 style="
          color: #fff;
          font-size: 24px;
          margin: 0 0 16px 0;
          font-weight: 600;
        ">🎧 Setup Required: VB-Audio Cable</h2>
        
        <p style="
          color: #b8b8d1;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 24px 0;
        ">
          To capture interviewer's audio during meetings, you need to install 
          <strong style="color: #4dabf7;">VB-Audio Cable</strong> 
          (a free virtual audio device).
        </p>

        <div style="
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border-left: 4px solid #4dabf7;
        ">
          <div style="color: #fff; font-weight: 600; margin-bottom: 12px;">
            ⚡ Quick Setup (5 minutes):
          </div>
          <ol style="
            color: #b8b8d1;
            font-size: 13px;
            line-height: 1.8;
            margin: 0;
            padding-left: 20px;
          ">
            <li>Download from: <a href="https://vb-audio.com/Cable/" target="_blank" style="color: #4dabf7; text-decoration: none;">vb-audio.com/Cable</a></li>
            <li>Run installer as Administrator</li>
            <li>Restart computer</li>
            <li>Configure Windows Sound Settings (see guide)</li>
          </ol>
        </div>

        <div style="
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        ">
          <button id="vb-view-guide" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            📖 View Setup Guide
          </button>
          <button id="vb-close-modal" style="
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            Skip for Now
          </button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('vb-view-guide').addEventListener('click', () => {
            window.electron.openExternal('file:///' + __dirname + '/../VB_AUDIO_SETUP.md');
            modal.remove();
        });

        document.getElementById('vb-close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Check and prompt if VB-Cable not detected
    async checkAndPrompt() {
        const result = await this.detectDevices();

        if (!result.hasVBCable) {
            console.warn('⚠️ VB-Audio Cable not detected');
            // Show modal after 2 seconds
            setTimeout(() => {
                this.showSetupModal();
            }, 2000);
            return false;
        } else {
            console.log('✅ VB-Audio Cable detected and ready');
            return true;
        }
    }

    // Select VB-Cable as audio source
    async useVBCable() {
        const vbDevice = this.getVBCableDevice();

        if (!vbDevice) {
            throw new Error('VB-Audio Cable not found');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: { exact: vbDevice.deviceId },
                echoCancellation: true,
                noiseSuppression: false, // Don't suppress meeting audio
                autoGainControl: false,
                sampleRate: 16000
            }
        });

        console.log('✅ Using VB-Cable:', vbDevice.label);
        return stream;
    }
}

// Export for use in overlay-whisper.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioDeviceHelper;
}
