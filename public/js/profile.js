/**
 * Profile Page Module
 */

import Auth from './auth.js';
import API from './api.js';
import Utils from './utils.js';

// Initialize
Auth.init().then(() => Auth.requireAuth());
Utils.loadDarkModePreference();

// Set user email
Auth.init().then(() => {
    if (Auth.user) {
        document.getElementById('userEmail').textContent = Auth.user.email;
    }
});

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('logoutBtnCard').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());
document.getElementById('profileForm').addEventListener('submit', saveProfile);
document.getElementById('darkModeCheckbox').addEventListener('change', () => Utils.toggleDarkMode());

// Load profile
async function loadProfile() {
    try {
        const user = await API.auth.getProfile();

        document.getElementById('email').value = user.email;
        document.getElementById('fullName').value = user.fullName;

        // Load preferences
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.getElementById('darkModeCheckbox').checked = isDarkMode;
    } catch (error) {
        Utils.showToast('Error loading profile', 'error');
    }
}

async function saveProfile(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!fullName.trim()) {
        Utils.showToast('Full name is required', 'error');
        return;
    }

    if (password && password.length < 8) {
        Utils.showToast('Password must be at least 8 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        Utils.showToast('Passwords do not match', 'error');
        return;
    }

    try {
        const btn = document.querySelector('.btn-primary');
        const originalText = btn.textContent;
        btn.innerHTML = '<span class="spinner"></span>';
        btn.disabled = true;

        await API.auth.updateProfile(fullName, password || null);

        // Clear password fields
        document.getElementById('password').value = '';
        document.getElementById('confirmPassword').value = '';

        Utils.showToast('Profile updated successfully', 'success');
    } catch (error) {
        Utils.showToast(error.message, 'error');
    } finally {
        const btn = document.querySelector('.btn-primary');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Initialize
loadProfile();
