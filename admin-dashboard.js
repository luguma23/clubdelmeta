// admin-dashboard.js - Funcionalidades del panel de administración
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Verificar estado de autenticación
    checkAuthState();
    
    // Configurar eventos de autenticación
    setupAuthEvents();
    
    // Cargar estadísticas del dashboard
    loadDashboardStats();
}

function checkAuthState() {
    const user = getCurrentUser();
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const loginPrompt = document.getElementById('login-prompt');
    const adminContent = document.getElementById('admin-content');
    const adminNav = document.getElementById('admin-nav');
    
    if (user && user.role) {
        // Usuario autenticado
        if (loginForm) loginForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
        if (adminNav) adminNav.style.display = 'flex';
        
        // Actualizar información del usuario
        updateUserDisplay(user);
        
    } else {
        // Usuario no autenticado
        if (loginForm) loginForm.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'flex';
        if (adminContent) adminContent.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
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
            loadDashboardStats();
        }, 1000);
        
    } else {
        showMessage('Usuario o contraseña incorrectos', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    showMessage('Sesión cerrada correctamente', 'success');
    
    setTimeout(() => {
        checkAuthState();
    }, 1000);
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

function loadDashboardStats() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Cargar estadísticas de espacios
    const spaces = JSON.parse(localStorage.getItem('spaces')) || [];
    const statsSpaces = document.getElementById('stats-spaces');
    if (statsSpaces) {
        statsSpaces.textContent = spaces.length;
    }
    
    // Cargar estadísticas de reservas (placeholder)
    const statsPending = document.getElementById('stats-pending');
    if (statsPending) {
        // Simular datos de reservas pendientes
        statsPending.textContent = '3';
    }
    
    // Cargar estadísticas de socios (placeholder)
    const statsMembers = document.getElementById('stats-members');
    if (statsMembers) {
        // Simular datos de socios
        statsMembers.textContent = '15';
    }
}

function showMessage(message, type) {
    // Eliminar mensajes anteriores
    const existingMessage = document.getElementById('dashboard-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.id = 'dashboard-message';
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insertar en el DOM
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
        adminContent.insertBefore(messageDiv, adminContent.firstChild);
    }
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Funciones de utilidad
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}