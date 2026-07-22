/**
 * Authentication and Session Management
 */

const AUTH_KEY = 'umkm_admin_session';

function checkAuth() {
    const session = sessionStorage.getItem(AUTH_KEY);
    if (!session) {
        window.location.href = '../login.html';
    }
}

function checkLogin() {
    const session = sessionStorage.getItem(AUTH_KEY);
    if (session) {
        window.location.href = 'admin/dashboard.html';
    }
}

function login(username, password) {
    // Default Credentials based on requirements
    const defaultUser = 'admin';
    const defaultPass = 'kknbbk2026';

    if (username === defaultUser && password === defaultPass) {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({
            username: username,
            loginAt: new Date().getTime()
        }));
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = '../login.html';
}

// Attach logout event if logout button exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});
