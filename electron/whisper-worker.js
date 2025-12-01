
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Skip local model check (download from HF Hub)
env.allowLocalModels = false;
env.useBrowserCache = true;

class AutomaticSpeechRecognitionPipeline {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-base.en';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, audio } = event.data;

    if (type === 'load') {
        try {
            await AutomaticSpeechRecognitionPipeline.getInstance((data) => {
                self.postMessage({ type: 'download', data });
            });
            self.postMessage({ type: 'ready' });
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    } else if (type === 'transcribe') {
        try {
            const transcriber = await AutomaticSpeechRecognitionPipeline.getInstance();

            const output = await transcriber(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe',
                return_timestamps: false,
                forced_decoder_ids: null,
                suppress_tokens: null,
            });

            console.log('Whisper raw output:', output);

            self.postMessage({ type: 'result', text: output.text });
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
});
