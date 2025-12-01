// Web Speech API Implementation
// Add this to overlay-whisper.html to replace MediaRecorder with free speech recognition

let recognition = null;

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            showAiMessage('⚠️ Speech recognition not supported. Please use Chrome.');
            return;
        }

        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('🎤 Speech recognition started');
            isRecording = true;
            updateUIState('recording');

            if (!isSessionActive) {
                isSessionActive = true;
                endCallBtn.classList.remove('hidden');
            }
        };

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript.trim();

            console.log('📝 Transcript:', transcript);

            if (transcript) {
                // Send directly to server
                socket.emit('text_query', { text: transcript });
                showUserMessage(transcript);
                updateUIState('processing');
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ Speech error:', event.error);
            if (event.error !== 'no-speech') {
                showAiMessage(`⚠️ Speech error: ${event.error}`);
                stopRecording();
            }
        };

        recognition.onend = () => {
            console.log('🛑 Speech recognition ended');
            if (isRecording) {
                recognition.start(); // Auto-restart
            }
        };

        recognition.start();

    } catch (error) {
        console.error('Recording error:', error);
        showAiMessage('⚠️ Could not start speech recognition.');
    }
}

function stopRecording() {
    if (!isRecording) return;

    isRecording = false;

    if (recognition) {
        recognition.stop();
        recognition = null;
    }

    updateUIState('ready');
}
