/**
 * Authentication and Session Management using Supabase
 */

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '../login.html';
    }
}

async function checkLogin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'admin/dashboard.html';
    }
}

async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Login error:', error.message);
        return false;
    }
}

async function logout() {
    try {
        await supabase.auth.signOut();
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Logout error:', error.message);
    }
}

// Setup auth state listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        const path = window.location.pathname;
        if (path.includes('/admin/')) {
            window.location.href = '../login.html';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logout();
        });
    }
});
