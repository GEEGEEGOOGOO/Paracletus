// Role Adoption Client-Side Logic
// To be added to overlay-whisper.html <script> section

// Initialize role adoption UI
let currentMode = 'general';
let currentRole = null;

// Mode selector elements
const modeButtons = document.querySelectorAll('.mode-btn');
const roleChip = document.getElementById('role-chip');
const roleName = document.getElementById('role-name');
const switchAllrounderBtn = document.getElementById('switch-allrounder');
const clearRoleBtn = document.getElementById('clear-role');

// Mode selector event listeners
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;

        if (mode === 'role' && !currentRole) {
            // Prompt user to upload resume
            alert('Please upload a resume first to use Role Adoption mode.');
            // Trigger file upload
            document.getElementById('file-input').click();
            return;
        }

        // Switch mode
        socket.emit('mode:switch', { mode: mode });
    });
});

// Switch to All-Rounder (general mode while keeping role loaded)
switchAllrounderBtn.addEventListener('click', () => {
    socket.emit('mode:switch', { mode: 'general' });
});

// Clear role
clearRoleBtn.addEventListener('click', () => {
    if (confirm('Clear current role? This will remove the loaded resume.')) {
        socket.emit('role:clear');
    }
});

// Socket event handlers for role adoption

socket.on('file:resume_parsed', (data) => {
    console.log('📄 Resume parsed:', data);

    // Show resume preview and offer to adopt role
    const resumeData = data.resumeData;
    const confidence = data.confidence;

    const message = `Resume parsed successfully!\\n\\nName: ${resumeData.name}\\nTitle: ${resumeData.title}\\nSkills: ${resumeData.skills.slice(0, 5).join(', ')}\\n\\nConfidence: ${(confidence * 100).toFixed(0)}%\\n\\nAdopt this role?`;

    if (confirm(message)) {
        // Adopt role
        socket.emit('role:adopt', {
            resumeData: resumeData,
            sessionId: socket.id
        });
    }
});

socket.on('role:adopted', (data) => {
    console.log('✅ Role adopted:', data);

    currentRole = data;
    currentMode = 'role';

    // Update UI
    roleName.textContent = `${data.name} (${data.title})`;
    roleChip.classList.remove('hidden');

    // Update mode buttons
    updateModeButtons('role');

    // Show success message
    showAiMessage(`✅ Now roleplaying as ${data.name}`);
});

socket.on('role:cleared', (data) => {
    console.log('🗑️ Role cleared');

    currentRole = null;
    currentMode = 'general';

    // Update UI
    roleChip.classList.add('hidden');

    // Update mode buttons
    updateModeButtons('general');

    showAiMessage('Role cleared. Switched to General mode.');
});

socket.on('mode:switched', (data) => {
    console.log('🔄 Mode switched:', data);

    currentMode = data.mode;
    updateModeButtons(data.mode);

    let modeLabel = {
        general: 'General AI',
        coding: 'Coding Assistant',
        role: 'Role Adoption'
    }[data.mode];

    statusText.textContent = `Mode: ${modeLabel}`;

    setTimeout(() => {
        statusText.textContent = 'Ready';
    }, 2000);
});

// Helper: Update mode button states
function updateModeButtons(activeMode) {
    modeButtons.forEach(btn => {
        if (btn.dataset.mode === activeMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Helper: Trigger resume parsing for uploaded file
// (Modify existing file upload handler)
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is resume-like (PDF with "resume" or "cv" in name)
    const isResumeFile = file.name.toLowerCase().includes('resume') ||
        file.name.toLowerCase().includes('cv') ||
        file.type === 'application/pdf';

    if (isResumeFile && currentMode === 'role') {
        // Parse as resume
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Data = event.target.result.split(',')[1];

            socket.emit('file:parse_resume', {
                fileData: base64Data,
                fileName: file.name,
                mimeType: file.type
            });

            showUserMessage(`Parsing resume: ${file.name}...`);
        };
        reader.readAsDataURL(file);

        fileInput.value = '';
        return;
    }

    // Otherwise, use existing file upload logic
    // [existing code continues...]
});

// Get current status on connect
socket.on('connect', () => {
    console.log('✅ Connected to server');
    statusText.textContent = 'Ready';

    // Request current mode and role status
    socket.emit('status:get');
});

socket.on('status:current', (data) => {
    console.log('📊 Current status:', data);

    if (data.role) {
        currentRole = data.role;
        roleName.textContent = `${data.role.name} (${data.role.title})`;
        roleChip.classList.remove('hidden');
    }

    if (data.mode) {
        currentMode = data.mode;
        updateModeButtons(data.mode);
    }
});
