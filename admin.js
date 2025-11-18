// auth.js - Sistema de autenticación completo
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Verificar si ya existe un usuario en localStorage
    checkAuthState();
    
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
    
    // También permitir Enter en el campo de usuario
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Crear usuarios por defecto si no existen
    createDefaultUsers();
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    showMessage('Sesión cerrada correctamente', 'success');
    
    setTimeout(() => {
        checkAuthState();
        // Recargar la página para actualizar completamente la interfaz
        window.location.reload();
    }, 1000);
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
            window.location.reload();
        }, 1000);
        
    } else {
        showMessage('Usuario o contraseña incorrectos', 'error');
    }
}

function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const loginPrompt = document.getElementById('login-prompt');
    const adminContent = document.getElementById('admin-content');
    
    if (user && user.role) {
        // Usuario autenticado - mostrar información del usuario
        if (loginForm) loginForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
        
        if (document.getElementById('user-display')) {
            document.getElementById('user-display').textContent = user.fullName || user.username;
        }
        if (document.getElementById('role-display')) {
            document.getElementById('role-display').textContent = user.role;
        }
        if (document.getElementById('welcome-message')) {
            document.getElementById('welcome-message').textContent = `Bienvenido, ${user.fullName || user.username}`;
        }
        
        applyRolePermissions(user.role);
    } else {
        // Usuario no autenticado - mostrar formulario de login
        if (loginForm) loginForm.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'flex';
        if (adminContent) adminContent.style.display = 'none';
    }
}

function applyRolePermissions(role) {
    // Ocultar/mostrar elementos según el rol
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const assistantOnlyElements = document.querySelectorAll('.assistant-only');
    
    if (role === 'asistente') {
        // Ocultar elementos solo para administradores
        adminOnlyElements.forEach(element => {
            element.style.display = 'none';
        });
        // Mostrar elementos para asistentes
        assistantOnlyElements.forEach(element => {
            element.style.display = 'block';
        });
    } else if (role === 'administrador') {
        // Mostrar todos los elementos
        adminOnlyElements.forEach(element => {
            element.style.display = 'block';
        });
        assistantOnlyElements.forEach(element => {
            element.style.display = 'block';
        });
    }
}

function showMessage(message, type) {
    // Eliminar mensajes anteriores
    const existingMessage = document.getElementById('auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.id = 'auth-message';
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = message;
    
    // Insertar en el DOM
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.appendChild(messageDiv);
    } else {
        document.body.insertBefore(messageDiv, document.body.firstChild);
    }
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Función para verificar si el usuario está autenticado (útil para otras páginas)
function isAuthenticated() {
    return localStorage.getItem('currentUser') !== null;
}

// Función para obtener el usuario actual
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Función para verificar permisos
function hasPermission(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    
    if (requiredRole === 'administrador') {
        return user.role === 'administrador';
    }
    
    return true; // Para roles de asistente o cualquier autenticado
}

// Función para proteger páginas (usar en otras páginas HTML)
function protectPage() {
    if (!isAuthenticated()) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'admin.html';
        return false;
    }
    return true;
}

// Función para proteger páginas según rol específico
function protectPageByRole(requiredRole) {
    if (!isAuthenticated()) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'admin.html';
        return false;
    }
    
    const user = getCurrentUser();
    if (user.role !== requiredRole) {
        alert('No tienes permisos para acceder a esta página');
        window.location.href = 'admin.html';
        return false;
    }
    
    return true;
}

// Función para agregar un nuevo usuario (solo administradores)
function addUser(userData) {
    if (!hasPermission('administrador')) {
        showMessage('No tienes permisos para agregar usuarios', 'error');
        return false;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.username === userData.username);
    if (existingUser) {
        showMessage('El nombre de usuario ya existe', 'error');
        return false;
    }
    
    // Agregar nuevo usuario
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...userData,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Usuario agregado correctamente', 'success');
    return true;
}

// Función para cambiar contraseña
function changePassword(username, newPassword) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        showMessage('Usuario no encontrado', 'error');
        return false;
    }
    
    users[userIndex].password = newPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('users', JSON.stringify(users));
    showMessage('Contraseña actualizada correctamente', 'success');
    return true;
}

// Exportar funciones para uso global (si es necesario)
window.auth = {
    initializeAuth,
    handleLogin,
    handleLogout,
    isAuthenticated,
    getCurrentUser,
    hasPermission,
    protectPage,
    protectPageByRole,
    addUser,
    changePassword
};