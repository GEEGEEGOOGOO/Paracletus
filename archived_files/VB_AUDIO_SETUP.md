# VB-Audio Cable Setup for Meeting Audio Capture

## Quick Setup (5 Minutes)

### Step 1: Install VB-Audio Cable
1. Download from: https://vb-audio.com/Cable/
2. Right-click `VBCABLE_Setup_x64.exe` → Run as Administrator
3. Click "Install Driver"
4. **Restart your computer**

### Step 2: Windows Sound Settings

#### A. Route Meeting App to Virtual Cable
```
Windows Settings → Sound → Advanced sound options
→ Find your meeting app (Zoom/Teams/Chrome)
→ Output: Select "CABLE Input"
```

#### B. Enable Listening to Virtual Cable
```
Sound Control Panel → Recording tab
→ Right-click "CABLE Output" → Properties → Listen tab
→ ✅ Check "Listen to this device"
→ Playback through: [Your Earphones]
→ Click Apply
```

#### C. Set Default Recording Device
```
Sound Control Panel → Recording tab
→ Right-click "CABLE Output" → Set as Default Device
```

### Step 3: Test
1. Join a meeting
2. Start your app
3. Record - it should now capture interviewer's audio!

## Audio Flow Diagram
```
Meeting App Audio
       ↓
CABLE Input (Virtual Device)
       ↓
CABLE Output (Virtual Device)
       ↓
    ┌──────┴──────┐
    ↓             ↓
Your App      Earphones
(Captures)    (You hear)
```

## Troubleshooting

**Can't hear audio?**
→ Enable "Listen to this device" on CABLE Output

**App doesn't capture?**
→ Set CABLE Output as default recording device

**Want to include your voice?**
→ Microphone Properties → Listen → Playback through "CABLE Input"

## Need detailed instructions?
See: [VB_AUDIO_CABLE_SETUP_DETAILED.md](vb_audio_cable_setup.md)
