# 🎤 Adilectus - Your AI Assistant with Vision

**Adilectus** is a powerful desktop application that helps you with voice queries, document analysis, and real-time AI assistance. Think of it as your personal AI buddy that can listen to you, read documents, and give smart answers!

---

## ✨ What Can Adilectus Do?

### 1. 🗣️ Voice Queries (Speak and Get Answers)
- Just speak your question, and Adilectus will answer you!
- Works completely offline using local speech recognition
- Super fast responses using AI models

### 2. 📄 Document Analysis (Upload and Understand)
- Upload PDF files and get instant summaries
- Ask questions about your documents
- Extract key points automatically

### 3. 🖼️ Screen Capture Analysis
- Capture your screen and ask questions about what you see
- Perfect for understanding diagrams, code, or any visual content

### 4. 💬 Smart Chat
- Have natural conversations with AI
- Remembers context from your previous questions
- Switch between different AI models (Groq, Gemini)

---

## 🎬 Demo & Tutorial

### 📹 Video Tutorial
> **Coming Soon!** A detailed video explaining how to use Adilectus will be added here.

<!-- Add your video link here -->
<!-- Example: [![Watch Tutorial](thumbnail.jpg)](https://youtube.com/your-video) -->

---

## 📸 Screenshots & Working Demo

### Main Interface
> **Screenshot coming soon!** The main Adilectus window with voice controls.

<!-- ![Main Interface](screenshots/main-interface.png) -->

### Document Analysis in Action
> **Screenshot coming soon!** Uploading and analyzing a PDF document.

<!-- ![Document Analysis](screenshots/document-analysis.png) -->

### Voice Query Demo
> **GIF coming soon!** A working demo of voice queries.

<!-- ![Voice Query Demo](screenshots/voice-demo.gif) -->

---

## 🚀 Quick Start (For Users Who Already Installed)

1. **Launch the App**
   - Go to your `PROJECT_101` folder
   - Double-click on **`Launch-App.vbs`**
   - Wait 5-10 seconds for the app to open

2. **Start Using**
   - Click the microphone button and speak your question
   - Or upload a PDF file to analyze
   - Or capture your screen and ask about it

---

## 🛠️ Features in Detail

### Voice Recognition
- Uses **Groq Whisper** for super-fast transcription
- Works in English
- Automatically filters out background noise

### AI Models
- **Gemini 2.5 Flash** - For document analysis and vision tasks
- **Llama 3.1 Instant** - For quick text responses
- Switch between models based on your needs

### Document Support
- **PDF Files** - Full text extraction and analysis
- **Images** - Visual understanding and description
- **Mixed Content** - Documents with both text and images

---

## 📁 Project Structure

```
PROJECT_101/
├── Launch-App.vbs          # 👈 Click this to start the app!
├── silent-start.bat        # Background startup script
├── .env                    # Your API keys (keep this private!)
├── electron/               # Desktop app interface
├── server/                 # Backend server
│   ├── services/          # AI services (Gemini, Groq)
│   ├── routes/            # API endpoints
│   └── db/                # Local database
└── temp/                   # Temporary files
```

---

## 🔑 API Keys Used

Adilectus uses these AI services:
- **Gemini API** (Google) - For document analysis
- **Groq API** - For voice transcription and chat

> **Note:** Your API keys are stored safely in the `.env` file and never shared.

---

## ⚙️ Configuration

All settings are in the `.env` file:

```ini
# AI Models
GEMINI_MODEL=gemini-2.5-flash
GROQ_MODEL=llama-3.1-8b-instant

# Server
PORT=3000
NODE_ENV=development
```

---

## 🆘 Troubleshooting

### App Not Starting?
1. Make sure you double-clicked `Launch-App.vbs`
2. Wait 10 seconds (server needs time to start)
3. Check if Node.js is installed (see Installation Guide)

### Voice Not Working?
1. Check your microphone permissions
2. Make sure your Groq API key is valid
3. Speak clearly and wait for the microphone icon to turn green

### Document Upload Failing?
1. Check your internet connection
2. Make sure the PDF is not corrupted
3. Try a smaller file (under 10MB)

---

## 🔒 Privacy & Security

- All processing happens on your computer
- API calls are encrypted (HTTPS)
- No data is stored on external servers
- Your documents are deleted after analysis

---

## 📞 Support

If you face any issues:
1. Check the **Installation Guide** for setup help
2. Look at the **Troubleshooting** section above
3. Make sure all dependencies are installed

---

## 🙏 Credits

Built with:
- **Electron** - Desktop app framework
- **Google Gemini** - AI for document analysis
- **Groq** - Fast AI inference
- **Node.js** - Backend server

---

## 📄 License

This project is for personal use. Please respect the API terms of service for Gemini and Groq.


