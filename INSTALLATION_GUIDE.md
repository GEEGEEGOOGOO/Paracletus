# 📦 Adilectus - Complete Installation Guide

**Welcome!** This guide will help you install Adilectus on your Windows computer from scratch. Even if you're completely new to computers, just follow these steps one by one.

---

## 🎯 What You'll Need

Before starting, make sure you have:
- A Windows computer (Windows 10 or 11)
- Internet connection
- About 30 minutes of time
- The Adilectus project folder (PROJECT_101)

---

## 📋 Step-by-Step Installation

### Step 1: Install Node.js (JavaScript Runtime)

**What is Node.js?** It's like a translator that helps your computer understand and run JavaScript code.

1. **Download Node.js**
   - Open your web browser (Chrome, Edge, etc.)
   - Go to: https://nodejs.org
   - You'll see two big green buttons
   - Click on the **LTS** button (it says "Recommended for most users")
   - A file will download (around 30MB)

2. **Install Node.js**
   - Find the downloaded file (usually in your Downloads folder)
   - Double-click the file (it's named something like `node-v20.x.x-x64.msi`)
   - Click "Next" → "Next" → "Next" → "Install"
   - Wait for it to finish (takes 2-3 minutes)
   - Click "Finish"

3. **Check if Node.js is Installed**
   - Press `Windows Key + R` on your keyboard
   - Type `cmd` and press Enter
   - A black window will open (this is called Command Prompt)
   - Type this and press Enter:
     ```
     node --version
     ```
   - You should see something like `v20.10.0`
   - If you see this, **Node.js is installed successfully!** ✅

---

### Step 2: Get Your API Keys

**What are API Keys?** Think of them as special passwords that let Adilectus talk to AI services (like Gemini and Groq).

#### 2.1 Get Gemini API Key (For Document Analysis)

1. **Go to Google AI Studio**
   - Open browser and go to: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click on "Create API Key" button
   - Click "Create API key in new project"
   - Copy the key (it looks like: `AIzaSyABC123...`)
   - **Save this somewhere safe!** (Notepad is good)

#### 2.2 Get Groq API Key (For Voice Recognition)

1. **Go to Groq Console**
   - Open browser and go to: https://console.groq.com/keys
   - Sign up with your email (it's free!)

2. **Create API Key**
   - Click "Create API Key"
   - Give it a name like "Adilectus"
   - Click "Submit"
   - Copy the key (it looks like: `gsk_ABC123...`)
   - **Save this somewhere safe!**

---

### Step 3: Set Up the Project Folder

1. **Locate Your Project**
   - You should have a folder called `PROJECT_101`
   - If you downloaded it as a ZIP file, right-click and choose "Extract All"
   - Move the folder to somewhere easy to find (like `D:\` drive)
   - Final path should be: `D:\PROJECT_101`

2. **Open the Folder**
   - Double-click to open `PROJECT_101` folder
   - You should see files like `Launch-App.vbs`, `.env`, `electron`, `server`, etc.

---

### Step 4: Add Your API Keys

1. **Find the .env File**
   - In the `PROJECT_101` folder, look for a file named `.env`
   - **Can't see it?** 
     - Click on "View" in the top menu
     - Check the box that says "File name extensions"
     - Check the box that says "Hidden items"
     - Now you should see `.env`

2. **Edit the .env File**
   - Right-click on `.env`
   - Choose "Open with" → "Notepad"
   - You'll see something like this:
     ```
     GEMINI_API_KEY=your_gemini_key_here
     GROQ_API_KEY=your_groq_key_here
     ```

3. **Paste Your Keys**
   - Replace `your_gemini_key_here` with your actual Gemini key
   - Replace `your_groq_key_here` with your actual Groq key
   - Example:
     ```
     GEMINI_API_KEY=AIzaSyABC123XYZ789
     GROQ_API_KEY=gsk_DEF456UVW012
     ```
   - **Important:** Don't add any spaces or quotes
   - Press `Ctrl + S` to save
   - Close Notepad

---

### Step 5: Install Project Dependencies

**What are dependencies?** These are like helper tools that Adilectus needs to work properly.

1. **Open Command Prompt in Project Folder**
   - Go to your `PROJECT_101` folder
   - Click on the address bar at the top (where it shows the folder path)
   - Type `cmd` and press Enter
   - A black window opens (Command Prompt) already in your project folder

2. **Install Dependencies**
   - In the black window, type this and press Enter:
     ```
     npm install
     ```
   - **Wait patiently!** This will take 5-10 minutes
   - You'll see lots of text scrolling (this is normal)
   - When it's done, you'll see something like:
     ```
     added 500 packages in 8m
     ```

3. **Install Server Dependencies**
   - Now type this and press Enter:
     ```
     cd server
     ```
   - Then type this and press Enter:
     ```
     npm install
     ```
   - Wait again (2-3 minutes)
   - When done, type this to go back:
     ```
     cd ..
     ```

---

### Step 6: First Time Setup Complete! 🎉

**Congratulations!** You've installed everything. Now let's test if it works.

---

## 🚀 Running Adilectus for the First Time

### Method 1: Using the Silent Launcher (Recommended)

1. **Go to PROJECT_101 Folder**
   - Open the `PROJECT_101` folder

2. **Double-Click Launch-App.vbs**
   - Find the file named `Launch-App.vbs`
   - Double-click it
   - **Nothing will happen for 5-10 seconds** (this is normal!)
   - The app window will appear automatically

3. **Success!**
   - You should see the Adilectus window
   - Try clicking the microphone and saying "Hello"
   - Try uploading a PDF file

### Method 2: Using Command Prompt (For Troubleshooting)

1. **Open Command Prompt**
   - Go to `PROJECT_101` folder
   - Click address bar, type `cmd`, press Enter

2. **Start the App**
   - Type this and press Enter:
     ```
     npm start
     ```
   - Wait for the app to open

---

## ✅ Verification Checklist

After installation, check these things:

- [ ] Node.js is installed (`node --version` shows a version number)
- [ ] API keys are added to `.env` file
- [ ] `npm install` completed without errors
- [ ] `Launch-App.vbs` opens the app successfully
- [ ] Voice recognition works (microphone button responds)
- [ ] PDF upload works (can upload and analyze documents)

---

## 🔧 Common Installation Problems

### Problem 1: "node is not recognized"
**Solution:**
- Node.js is not installed properly
- Go back to Step 1 and reinstall Node.js
- Make sure to restart your computer after installation

### Problem 2: "npm install" gives errors
**Solution:**
- Check your internet connection
- Try running Command Prompt as Administrator:
  - Search for "cmd" in Start Menu
  - Right-click → "Run as administrator"
  - Navigate to project folder and try again

### Problem 3: App doesn't start
**Solution:**
- Check if API keys are correct in `.env` file
- Make sure there are no extra spaces in the keys
- Try running `npm start` from Command Prompt to see error messages

### Problem 4: "Cannot find module" error
**Solution:**
- You missed installing dependencies
- Go back to Step 5
- Run `npm install` in both main folder and `server` folder

### Problem 5: Voice recognition not working
**Solution:**
- Check if your Groq API key is valid
- Make sure your microphone is connected
- Check Windows microphone permissions:
  - Settings → Privacy → Microphone
  - Allow apps to access microphone

---

## 📚 What Did We Install?

Here's a simple explanation of what each thing does:

| Tool | What It Does | Why We Need It |
|------|--------------|----------------|
| **Node.js** | Runs JavaScript code on your computer | Adilectus is built with JavaScript |
| **npm** | Installs helper tools (comes with Node.js) | Downloads all the libraries Adilectus needs |
| **Electron** | Creates desktop apps from web code | Makes Adilectus look like a normal Windows app |
| **Express** | Handles server requests | Manages communication between app parts |
| **Socket.io** | Real-time communication | Sends voice data instantly |
| **Gemini SDK** | Talks to Google's AI | Analyzes documents and images |
| **Groq SDK** | Talks to Groq's AI | Converts speech to text super fast |

---

## 🎓 Next Steps

Now that Adilectus is installed:

1. **Read the Main README**
   - Open `README.md` to learn all features
   - Watch the tutorial video (when available)

2. **Try Different Features**
   - Upload a PDF and ask questions
   - Use voice commands
   - Capture your screen and analyze it

3. **Customize Settings**
   - Edit `.env` to change AI models
   - Adjust server port if needed

---

## 💡 Tips for Beginners

- **Don't be scared of the black window (Command Prompt)** - It's just a way to give instructions to your computer
- **Save your API keys safely** - You'll need them if you reinstall
- **Read error messages carefully** - They usually tell you exactly what's wrong
- **Google is your friend** - If you see an error, copy-paste it in Google

---

## 🆘 Still Need Help?

If you're stuck:
1. Read the error message carefully
2. Check the "Common Problems" section above
3. Make sure you followed every step exactly
4. Try restarting your computer and starting fresh

---

## 🎉 You're All Set!

Congratulations on installing Adilectus! You now have a powerful AI assistant on your computer.

**Enjoy using Adilectus!** 🚀

---

