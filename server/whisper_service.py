#!/usr/bin/env python3
"""
Whisper STT Service
Runs OpenAI Whisper locally for speech-to-text transcription.
Accepts audio via stdin, outputs JSON transcription to stdout.
"""

import sys
import json
import whisper
import numpy as np
import io
import warnings
warnings.filterwarnings("ignore")

# Load model once at startup
MODEL_SIZE = "small"
print(f"Loading Whisper model: {MODEL_SIZE}...", file=sys.stderr)
model = whisper.load_model(MODEL_SIZE)
print("Whisper model loaded successfully!", file=sys.stderr)

def transcribe_audio(audio_bytes):
    """
    Transcribe audio from raw bytes.
    Expected format: Float32 PCM, 16kHz, mono
    """
    try:
        # Convert bytes to numpy array
        audio_array = np.frombuffer(audio_bytes, dtype=np.float32)
        
        # Whisper expects audio in [-1, 1] range
        # If already normalized, this is fine. Otherwise, normalize:
        if audio_array.max() > 1.0 or audio_array.min() < -1.0:
            audio_array = audio_array / np.abs(audio_array).max()
        
        # Transcribe
        result = model.transcribe(audio_array, language="en", fp16=False)
        
        return {
            "success": True,
            "text": result["text"].strip(),
            "language": result.get("language", "en")
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    """
    Main loop: read audio from stdin, transcribe, output JSON to stdout.
    Protocol: 
    - Read 4 bytes (int32) for audio length
    - Read that many bytes of audio data
    - Transcribe and output JSON
    """
    print("Whisper service ready. Waiting for audio...", file=sys.stderr)
    
    while True:
        try:
            # Read length prefix (4 bytes, little-endian int32)
            length_bytes = sys.stdin.buffer.read(4)
            if not length_bytes or len(length_bytes) < 4:
                print("No more input, exiting.", file=sys.stderr)
                break
            
            audio_length = int.from_bytes(length_bytes, byteorder='little')
            print(f"Receiving {audio_length} bytes of audio...", file=sys.stderr)
            
            # Read audio data
            audio_bytes = sys.stdin.buffer.read(audio_length)
            if len(audio_bytes) < audio_length:
                print(f"Incomplete audio data: expected {audio_length}, got {len(audio_bytes)}", file=sys.stderr)
                continue
            
            # Transcribe
            result = transcribe_audio(audio_bytes)
            
            # Output JSON to stdout
            print(json.dumps(result), flush=True)
            
        except KeyboardInterrupt:
            print("Service interrupted.", file=sys.stderr)
            break
        except Exception as e:
            error_result = {"success": False, "error": str(e)}
            print(json.dumps(error_result), flush=True)

if __name__ == "__main__":
    main()
