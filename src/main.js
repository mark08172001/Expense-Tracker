import Auth from './lib/auth.js';
import Utils from './lib/utils.js';

Utils.loadDarkModePreference();

(async () => {
  const isAuth = await Auth.init();

  if (isAuth && window.location.pathname === '/') {
    window.location.href = '/dashboard.html';
  }
})();

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;

    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('show'));
    document.getElementById(tabName + 'Form').classList.add('show');
  });
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const originalText = btn.innerHTML;

  try {
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    await Auth.login(email, password);
    Utils.showToast('Login successful!', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 500);
  } catch (error) {
    // Error already shown by Auth module
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  const originalText = btn.innerHTML;

  try {
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (password.length < 8) {
      Utils.showToast('Password must be at least 8 characters', 'error');
      return;
    }

    await Auth.register(email, password, name);
    Utils.showToast('Registration successful!', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 500);
  } catch (error) {
    // Error already shown
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});
