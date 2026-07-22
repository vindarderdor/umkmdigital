/**
 * UI Interactions (Animations, Toasts, Theme)
 */

// 1. Toast Notification System
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    // Remove toast after animation ends (3s delay + 0.3s fadeout)
    setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
            container.remove();
        }
    }, 3300);
}

// 2. Loading Screen
function hideLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 500);
    }
}

// 3. Scroll to Top
function initScrollToTop() {
    const btn = document.getElementById('scrollToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 4. Dark Mode Toggle
function initDarkMode() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Check LocalStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    toggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

// 5. Scroll Reveal Animation
window.initScrollReveal = function() {
    const reveals = document.querySelectorAll('.reveal, .reveal-zoom');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    reveals.forEach(reveal => {
        if (!reveal.classList.contains('active')) {
            observer.observe(reveal);
        }
    });
}

// 6. Mobile Menu Toggle
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('navLinks');
    
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('active');
            const icon = btn.querySelector('i');
            if (menu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// 7. Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// 8. Counter Animation for Stats
function initCounter() {
    const counters = document.querySelectorAll('.counter-anim');
    if (!counters.length) return;

    const runCounter = (el) => {
        const target = +el.getAttribute('data-target');
        const count = +el.innerText;
        const inc = target / 50;

        if (count < target) {
            el.innerText = Math.ceil(count + inc);
            setTimeout(() => runCounter(el), 20);
        } else {
            el.innerText = target;
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counter.innerText = '0';
        observer.observe(counter);
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Hide loader after a short delay
    setTimeout(hideLoader, 500);

    initScrollToTop();
    initDarkMode();
    initScrollReveal();
    initMobileMenu();
    initNavbarScroll();
    initCounter();
});

// Modal Utilities
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});
