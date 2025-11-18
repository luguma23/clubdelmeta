// auth.js - Sistema de autenticación COMPLETO
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Crear usuarios por defecto si no existen
    createDefaultUsers();
    
    // Verificar si ya existe un usuario en localStorage
    checkAuthState();
    
    // Configurar eventos de autenticación
    setupAuthEvents();
}

function createDefaultUsers() {
    const users = JSON.parse(localStorage.getItem('users'));
    
    if (!users || users.length === 0) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                role: 'administrador',
                email: 'admin@clubelmeta.com',
                fullName: 'Administrador General',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'asistente',
                password: 'asistente123',
                role: 'asistente',
                email: 'asistente@clubelmeta.com',
                fullName: 'Asistente de Gerencia',
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('Usuarios por defecto creados');
    }
}

function setupAuthEvents() {
    // Configurar evento del botón de login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Configurar evento del botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Permitir login con Enter
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const userSession = {
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            email: user.email,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        showMessage(`Bienvenido, ${user.fullName}`, 'success');
        
        setTimeout(() => {
            checkAuthState();
            // Si estamos en admin.html, recargar el dashboard
            if (window.location.pathname.includes('admin.html')) {
                window.location.reload();
            }
        }, 1000);
        
    } else {
        showMessage('Usuario o contraseña incorrectos', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    showMessage('Sesión cerrada correctamente', 'success');
    
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 1000);
}

function checkAuthState() {
    const user = getCurrentUser();
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const loginPrompt = document.getElementById('login-prompt');
    const adminContent = document.getElementById('admin-content');
    const adminNav = document.getElementById('admin-nav');
    
    if (user && user.role) {
        if (loginForm) loginForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
        if (adminNav) adminNav.style.display = 'flex';
        
        updateUserDisplay(user);
        
    } else {
        if (loginForm) loginForm.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'flex';
        if (adminContent) adminContent.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
    }
}

function updateUserDisplay(user) {
    if (document.getElementById('user-display')) {
        document.getElementById('user-display').textContent = user.fullName || user.username;
    }
    if (document.getElementById('role-display')) {
        document.getElementById('role-display').textContent = user.role;
    }
    if (document.getElementById('welcome-message')) {
        document.getElementById('welcome-message').textContent = `Bienvenido, ${user.fullName || user.username}`;
    }
}

function showMessage(message, type) {
    const existingMessage = document.getElementById('auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'auth-message';
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.appendChild(messageDiv);
    } else {
        document.body.insertBefore(messageDiv, document.body.firstChild);
    }
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Funciones de utilidad para otras páginas
function isAuthenticated() {
    const user = localStorage.getItem('currentUser');
    if (!user) return false;
    
    try {
        const userData = JSON.parse(user);
        return userData && userData.role;
    } catch (error) {
        return false;
    }
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        try {
            return JSON.parse(user);
        } catch (error) {
            return null;
        }
    }
    return null;
}

// Hacer funciones disponibles globalmente
window.auth = {
    initializeAuth,
    handleLogin,
    handleLogout,
    isAuthenticated,
    getCurrentUser
};