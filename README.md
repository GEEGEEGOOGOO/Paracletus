# Wieesion – Advanced AI Meeting Assistant

**Wieesion** is a sleek, overlay‑style AI assistant for interviews and meetings. It provides real‑time Q&A, screen analysis, audio transcription, and automatic meeting summaries.

## 🚀 Key Features

- **Real‑time Q&A** using Google Gemini 2.5 Flash
- **Always‑On Listening** with voice‑activity detection
- **Screen Vision** – ask “What’s on my screen?”
- **Glassmorphism UI** – translucent, resizable overlay
- **Portable Windows executable** (`Wieesion Setup 1.0.0.exe`)

## 🛠️ Installation (Development)

1. **Prerequisites**
   - Windows 10/11 (x64)
   - Node.js v16+ (for building only)
   - Python 3.10+ (if any native backend deps are needed)
2. **Clone the repository**
   ```bash
   git clone https://github.com/GEEGEEGOOGOO/InterviewBuddy.git
   cd InterviewBuddy
   ```
3. **Install dependencies**
   ```bash
   npm install          # root dependencies
   cd server && npm install   # backend dependencies
   ```
4. **Configure environment variables**
   Create a `.env` file inside `server/`:
   ```env
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   GROQ_API_KEY=your_groq_key   # optional
   PORT=3000
   GEMINI_MODEL=gemini-2.5-flash
   ```
5. **Run the app in development**
   ```bash
   npm start
   ```
   The Electron overlay will appear and the backend server will listen on the configured port.

## 📦 Portable Build (Production)

1. **Build the installer**
   ```bash
   npm run build   # runs electron‑builder
   ```
   After the build finishes, the `dist` folder will contain `Wieesion Setup 1.0.0.exe`.
2. **Distribute the `.exe`**
   - No Node.js or other runtime is required on the target machine.
   - Double‑click the installer to install the app (or run the executable directly).
3. **Running the portable version**
   ```bash
   cd dist
   "Wieesion Setup 1.0.0.exe"
   ```
   The app stores its SQLite database and temporary audio files in the user’s AppData directory, so it works out‑of‑the‑box on any Windows laptop.

## ▶️ Usage (Both Development & Portable)

- **Start the app** (development) – `npm start`
- **Start the app** (portable) – launch the installed `.exe`
- **Controls**
  - Mic icon – toggle recording / always‑on mode
  - "What's on my screen?" – trigger visual analysis
  - End Call – generate meeting summary and follow‑up draft
  - `Ctrl+Shift+V` – toggle stealth visibility

## 🏗️ Tech Stack
- **Frontend:** Electron, HTML5, CSS3 (glassmorphism), vanilla JavaScript
- **Backend:** Node.js, Express, Socket.IO
- **AI/ML:** Google Gemini 2.5 Flash (text & vision), OpenAI Whisper (speech‑to‑text)


Wieesion is a stealthy, intelligent overlay assistant designed for interviews and meetings. It provides real-time AI support, screen analysis, and automated post-meeting summaries.

## 🚀 Key Features

### 🧠 Smart Intelligence
- **Real-time Q&A:** Instant answers to your questions using Google Gemini 2.5 Flash.
- **Always-On Listening:** Continuous listening mode with **Voice Activity Detection (VAD)**. Automatically detects when you stop speaking (3s silence) and processes your request.
- **Smart Noise Filter:** Distinguishes between actual questions/commands and background chatter/noise.
- **Vision Capabilities:** Ask "What's on my screen?" to get instant analysis of shared content, code, or diagrams.

### 🎨 Premium UI
- **Glassmorphism Design:** Beautiful, translucent floating capsule that blends into your desktop.
- **Fully Resizable:** 360-degree resizing from any edge or corner.
- **Compact Mode:** Shrinkable down to a tiny 150x150px micro-player.
- **Stealth Mode:** Invisible to screen sharing tools (Zoom, Teams, Meet, OBS) and screenshots.

### 📝 Post-Call Automation
- **Meeting Summary:** Automatically generates structured minutes (Topics, Decisions, Actions) when you end a call.
- **Follow-up Draft:** Instantly drafts a professional follow-up email based on the conversation.

## 🛠️ Installation

1. **Prerequisites**
   - Node.js (v16+)
   - Python 3.10+ (for backend dependencies if needed)

2. **Install Dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Configuration**
   Create a `.env` file in the `server/` directory with your API keys:
   ```env
   # AI Providers
   GEMINI_API_KEY=your_gemini_key_here
   OPENAI_API_KEY=your_openai_key_here
   GROQ_API_KEY=your_groq_key_here (Optional)
   
   # Settings
   PORT=3000
   GEMINI_MODEL=gemini-2.5-flash
   ```

## ▶️ Usage

1. **Start the App**
   ```bash
   npm start
   ```

2. **Controls**
   - **Mic Icon:** Toggle recording (Click once for Always-On mode).
   - **"What's on my screen?":** Triggers visual analysis.
   - **End Call:** Stops session and generates summary.
   - **Ctrl+Shift+V:** Toggle visibility (Stealth Mode).

## 🏗️ Tech Stack
- **Frontend:** Electron, HTML5, CSS3 (Glassmorphism), Vanilla JS
- **Backend:** Node.js, Socket.IO, Express
- **AI/ML:** Google Gemini 2.5 Flash (Text & Vision), OpenAI Whisper (STT)
