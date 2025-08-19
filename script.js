// Simple client-side auth using localStorage
function getCurrentUser() {
    try {
        const raw = localStorage.getItem('rb_current_user');
        return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
    }
}

function setupAuthBar() {
    const user = getCurrentUser();
    const welcomeUser = document.getElementById('welcomeUser');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!welcomeUser || !loginLink || !registerLink || !logoutBtn) return;
    if (user) {
        welcomeUser.style.display = 'inline';
        welcomeUser.textContent = `Welcome, ${user.fullName}`;
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        logoutBtn.onclick = () => {
            localStorage.removeItem('rb_current_user');
            window.location.href = 'login.html';
        };
    } else {
        welcomeUser.style.display = 'none';
        loginLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        logoutBtn.style.display = 'none';
    }
}

// Protect the main page
if (document.getElementById('resumeForm')) {
    requireAuth();
}

// Get all form elements
const form = document.getElementById('resumeForm');
const inputs = form ? form.querySelectorAll('input, textarea') : [];

// Photo upload handling (resume page only)
const photoInput = document.getElementById('photoInput');
if (photoInput) {
    photoInput.addEventListener('change', handlePhotoUpload);
}

// Real-time preview update
inputs.forEach(input => {
    input.addEventListener('input', updatePreview);
});

// Handle photo upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoPreview = document.getElementById('photoPreview');
            const headerPhoto = document.getElementById('headerPhoto');
            
            // Update form preview
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
            
            // Update resume header
            headerPhoto.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
        };
        reader.readAsDataURL(file);
    }
}

// Experience type toggle
const experienceType = document.getElementById('experienceType');
const experienceContainerEl = document.getElementById('experienceContainer');
const addExperienceBtn = document.getElementById('addExperienceBtn');
const fresherNoteEl = document.getElementById('fresherNote');
const previewExperienceSection = document.getElementById('previewExperienceSection');

if (experienceType && experienceContainerEl && addExperienceBtn && fresherNoteEl) {
    experienceType.addEventListener('change', () => {
        const isFresher = experienceType.value === 'fresher';
        experienceContainerEl.style.display = isFresher ? 'none' : 'block';
        addExperienceBtn.style.display = isFresher ? 'none' : 'inline-block';
        fresherNoteEl.style.display = isFresher ? 'block' : 'none';
        updateExperiencePreview();
    });
}

// Update preview when form is submitted
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updatePreview();
        alert('Resume generated successfully! Check the preview on the right.');
    });
}

// Function to update preview in real-time
function updatePreview() {
    // Personal Information
    const fullNameInput = document.getElementById('fullName');
    if (!fullNameInput) return; // not on resume page
    document.getElementById('previewName').textContent = 
        fullNameInput.value || 'Your Name';
    
    const email = document.getElementById('email').value || 'Email';
    const phone = document.getElementById('phone').value || 'Phone';
    const address = document.getElementById('address').value || 'Address';
    
    document.getElementById('previewContact').textContent = 
        `${email} | ${phone} | ${address}`;
    
    // Professional Summary
    document.getElementById('previewSummary').textContent = 
        document.getElementById('summary').value || 'Your professional summary will appear here...';
    
    // Education
    document.getElementById('previewDegree').textContent = 
        document.getElementById('degree').value || 'Degree';
    document.getElementById('previewInstitution').textContent = 
        document.getElementById('institution').value || 'Institution';
    
    const graduationYear = document.getElementById('graduationYear').value || 'Graduation Year';
    const gpa = document.getElementById('gpa').value;
    document.getElementById('previewGraduation').textContent = 
        gpa ? `${graduationYear} | GPA: ${gpa}` : graduationYear;
    
    // Work Experience - Multiple experiences or Fresher note
    updateExperiencePreview();
    
    // Skills
    const skills = document.getElementById('skills').value || 'Your skills will appear here...';
    document.getElementById('previewSkills').textContent = skills;
    
    // Projects
    document.getElementById('previewProjectTitle').textContent = 
        document.getElementById('projectTitle').value || 'Project Title';
    document.getElementById('previewProjectDesc').textContent = 
        document.getElementById('projectDescription').value || 'Project description will appear here...';
}

// --- Auth: users storage helpers ---
function getAllUsers() {
    try {
        const raw = localStorage.getItem('rb_users');
        return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
}

function saveAllUsers(users) {
    localStorage.setItem('rb_users', JSON.stringify(users));
}

// Function to update experience preview
function updateExperiencePreview() {
    const experienceContainer = document.getElementById('experienceContainer');
    const previewExperience = document.getElementById('previewExperience');
    const isFresher = document.getElementById('experienceType').value === 'fresher';
    
    if (isFresher) {
        previewExperience.innerHTML = '';
        return;
    }

    let experienceHTML = '';
    const experienceItems = experienceContainer.querySelectorAll('.experience-item');
    
    experienceItems.forEach((item, index) => {
        const jobTitle = item.querySelector('.jobTitle').value || 'Job Title';
        const company = item.querySelector('.company').value || 'Company';
        const duration = item.querySelector('.jobDuration').value || 'Duration';
        const description = item.querySelector('.jobDescription').value || 'Job description will appear here...';
        
        experienceHTML += `
            <div class="experience-preview">
                <p><strong>${jobTitle}</strong> at <strong>${company}</strong></p>
                <p>${duration}</p>
                <p>${description}</p>
            </div>
        `;
    });
    
    previewExperience.innerHTML = experienceHTML;
}

// Download resume function
function downloadResume() {
    const resumeContent = document.getElementById('resumePreview').innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Replace body content with just the resume
    document.body.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
            ${resumeContent}
        </div>
    `;
    
    // Print the resume
    window.print();
    
    // Restore original content
    document.body.innerHTML = originalContent;
    
    // Reattach event listeners
    attachEventListeners();
}

// Function to reattach event listeners after print
function attachEventListeners() {
    const formLocal = document.getElementById('resumeForm');
    if (!formLocal) return;
    const inputsLocal = formLocal.querySelectorAll('input, textarea');
    inputsLocal.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
    formLocal.addEventListener('submit', function(e) {
        e.preventDefault();
        updatePreview();
        alert('Resume generated successfully! Check the preview on the right.');
    });
}

// Add new experience item
function addExperience() {
    const container = document.getElementById('experienceContainer');
    const newItem = document.createElement('div');
    newItem.className = 'experience-item';
    
    newItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeExperience(this)">×</button>
        <input type="text" class="jobTitle" placeholder="Job Title" required>
        <input type="text" class="company" placeholder="Company Name" required>
        <input type="text" class="jobDuration" placeholder="Duration (e.g., 2020-2023)" required>
        <textarea class="jobDescription" placeholder="Describe your responsibilities and achievements..." rows="4" required></textarea>
    `;
    
    container.appendChild(newItem);
    
    // Add event listeners to new inputs
    const newInputs = newItem.querySelectorAll('input, textarea');
    newInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

// Remove experience item
function removeExperience(button) {
    const item = button.parentElement;
    if (document.querySelectorAll('.experience-item').length > 1) {
        item.remove();
        updatePreview();
    } else {
        alert('You must have at least one work experience entry.');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupAuthBar();
    // Register page
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('regFullName').value.trim();
            const email = document.getElementById('regEmail').value.trim().toLowerCase();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirmPassword').value;
            if (!fullName || !email || !password) {
                alert('Please fill in all fields.');
                return;
            }
            if (password !== confirm) {
                alert('Passwords do not match.');
                return;
            }
            const users = getAllUsers();
            if (users.some(u => u.email === email)) {
                alert('An account with this email already exists.');
                return;
            }
            users.push({ id: Date.now(), fullName, email, password });
            saveAllUsers(users);
            localStorage.setItem('rb_current_user', JSON.stringify({ fullName, email }));
            window.location.href = 'index.html';
        });
    }

    // Login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const users = getAllUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                alert('Invalid email or password.');
                return;
            }
            localStorage.setItem('rb_current_user', JSON.stringify({ fullName: user.fullName, email: user.email }));
            window.location.href = 'index.html';
        });
    }

    if (document.getElementById('resumeForm')) {
        updatePreview();
    }
});
