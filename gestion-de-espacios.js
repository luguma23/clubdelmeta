// gestion-de-espacios.js - Gestión completa de espacios CON PROTECCIÓN
document.addEventListener('DOMContentLoaded', function() {
    // VERIFICAR AUTENTICACIÓN ANTES DE INICIALIZAR
    if (!isAuthenticated()) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'admin.html';
        return;
    }
    
    initializeSpaces();
});

function initializeSpaces() {
    // Mostrar información del usuario
    displayUserInfo();
    
    // Configurar según la página actual
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'espacios.html') {
        setupAddPage();
    } else if (currentPage === 'editar-espacios.html') {
        setupEditPage();
    } else if (currentPage === 'ver-espacios.html') {
        setupViewPage();
    }
}

function displayUserInfo() {
    const user = getCurrentUser();
    const userDisplay = document.getElementById('user-display');
    if (user && userDisplay) {
        userDisplay.textContent = user.fullName || user.username;
    }
}

// Página: Agregar Espacio
function setupAddPage() {
    // Configurar eventos del formulario
    const spaceForm = document.getElementById('space-form');
    if (spaceForm) {
        spaceForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Configurar subida de imágenes
    setupImageUpload();
    
    // Cargar datos de edición si existe parámetro en URL
    loadEditData();
}

// Página: Editar Espacios
function setupEditPage() {
    // Configurar búsqueda
    const searchInput = document.getElementById('search-edit-spaces');
    if (searchInput) {
        searchInput.addEventListener('input', filterEditSpaces);
    }
    
    // Cargar espacios para editar
    loadEditSpaces();
}

// Página: Ver Espacios
function setupViewPage() {
    // Configurar búsqueda
    const searchInput = document.getElementById('search-view-spaces');
    if (searchInput) {
        searchInput.addEventListener('input', filterViewSpaces);
    }
    
    // Cargar espacios para ver
    loadViewSpaces();
    loadStats();
}

// Funciones para Agregar Espacio
function setupImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('space-images');
    
    if (!uploadArea || !fileInput) return;
    
    // Click en el área de upload
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#1e3c72';
        uploadArea.style.background = '#f0f4ff';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = '#f8f9fa';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = '#f8f9fa';
        
        if (e.dataTransfer.files.length > 0) {
            handleImageFiles(e.dataTransfer.files);
        }
    });
    
    // Cambio en el input de archivo
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleImageFiles(this.files);
        }
    });
}

function handleImageFiles(files) {
    const imagePreview = document.getElementById('image-preview');
    if (!imagePreview) return;
    
    // Mostrar loading
    imagePreview.innerHTML = '<p class="no-images">Cargando imágenes...</p>';
    
    let loadedCount = 0;
    const totalFiles = Math.min(files.length, 10);
    
    Array.from(files).slice(0, 10).forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert(`El archivo "${file.name}" no es una imagen válida`);
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert(`La imagen "${file.name}" es demasiado grande (máximo 5MB)`);
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            loadedCount++;
            
            if (imagePreview.querySelector('.no-images')) {
                imagePreview.innerHTML = '';
            }
            
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image" onclick="removeImage(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            imagePreview.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    });
}

function removeImage(button) {
    const previewItem = button.closest('.preview-item');
    if (previewItem) {
        previewItem.remove();
        
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview && imagePreview.children.length === 0) {
            imagePreview.innerHTML = '<p class="no-images">No hay imágenes seleccionadas</p>';
        }
    }
}

function clearImages() {
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview) {
        imagePreview.innerHTML = '<p class="no-images">No hay imágenes seleccionadas</p>';
        document.getElementById('space-images').value = '';
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const spaceId = document.getElementById('editing-space-id') ? document.getElementById('editing-space-id').value : null;
    const spaceData = {
        name: document.getElementById('space-name').value.trim(),
        type: document.getElementById('space-type').value,
        category: document.getElementById('space-category').value,
        capacity: document.getElementById('space-capacity').value ? 
                 parseInt(document.getElementById('space-capacity').value) : null,
        description: document.getElementById('space-description').value.trim(),
        tariffNormal: parseFloat(document.getElementById('space-tariff-normal').value),
        tariffMember: parseFloat(document.getElementById('space-tariff-member').value),
        tariffNotes: document.getElementById('space-tariff-notes') ? document.getElementById('space-tariff-notes').value.trim() : '',
        images: getCurrentImages(),
        updatedAt: new Date().toISOString()
    };
    
    if (!validateForm(spaceData)) {
        return;
    }
    
    const spaces = getData('spaces') || [];
    
    if (spaceId) {
        // Editar espacio existente
        const spaceIndex = spaces.findIndex(s => s.id === parseInt(spaceId));
        if (spaceIndex !== -1) {
            spaces[spaceIndex] = {
                ...spaces[spaceIndex],
                ...spaceData
            };
            
            if (setData('spaces', spaces)) {
                showMessage('Espacio actualizado correctamente', 'success');
                setTimeout(() => {
                    window.location.href = 'ver-espacios.html';
                }, 2000);
            } else {
                showMessage('Error al actualizar el espacio', 'error');
            }
        }
    } else {
        // Agregar nuevo espacio
        const newId = spaces.length > 0 ? Math.max(...spaces.map(s => s.id)) + 1 : 1;
        
        const newSpace = {
            id: newId,
            ...spaceData,
            createdAt: new Date().toISOString(),
            active: true
        };
        
        spaces.push(newSpace);
        
        if (setData('spaces', spaces)) {
            showMessage('Espacio agregado correctamente', 'success');
            resetForm();
            clearImages();
            
            setTimeout(() => {
                window.location.href = 'ver-espacios.html';
            }, 2000);
        } else {
            showMessage('Error al guardar el espacio', 'error');
        }
    }
}

function getCurrentImages() {
    const previewItems = document.querySelectorAll('.preview-item img');
    return Array.from(previewItems).map(img => img.src);
}

function validateForm(spaceData) {
    if (!spaceData.name) {
        showMessage('El nombre del espacio es requerido', 'error');
        return false;
    }
    
    if (!spaceData.type) {
        showMessage('El tipo de espacio es requerido', 'error');
        return false;
    }
    
    if (!spaceData.category) {
        showMessage('La categoría es requerida', 'error');
        return false;
    }
    
    if (spaceData.tariffNormal < 0 || spaceData.tariffMember < 0) {
        showMessage('Las tarifas no pueden ser negativas', 'error');
        return false;
    }
    
    if (spaceData.capacity && spaceData.capacity < 1) {
        showMessage('La capacidad debe ser mayor a 0', 'error');
        return false;
    }
    
    return true;
}

function resetForm() {
    document.getElementById('space-form').reset();
    clearImages();
    
    // Limpiar ID de edición si existe
    const editingId = document.getElementById('editing-space-id');
    if (editingId) {
        editingId.value = '';
    }
}

function loadEditData() {
    // Cargar datos de edición si existe un ID en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        const spaces = getData('spaces') || [];
        const space = spaces.find(s => s.id === parseInt(editId));
        
        if (space) {
            // Crear campo hidden para el ID si no existe
            if (!document.getElementById('editing-space-id')) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.id = 'editing-space-id';
                hiddenInput.name = 'editing-space-id';
                document.getElementById('space-form').appendChild(hiddenInput);
            }
            
            // Llenar formulario con datos del espacio
            document.getElementById('editing-space-id').value = space.id;
            document.getElementById('space-name').value = space.name;
            document.getElementById('space-type').value = space.type;
            document.getElementById('space-category').value = space.category;
            document.getElementById('space-capacity').value = space.capacity || '';
            document.getElementById('space-description').value = space.description || '';
            document.getElementById('space-tariff-normal').value = space.tariffNormal;
            document.getElementById('space-tariff-member').value = space.tariffMember;
            
            if (document.getElementById('space-tariff-notes')) {
                document.getElementById('space-tariff-notes').value = space.tariffNotes || '';
            }
            
            // Cargar imágenes si existen
            if (space.images && space.images.length > 0) {
                const imagePreview = document.getElementById('image-preview');
                imagePreview.innerHTML = '';
                
                space.images.forEach(src => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${src}" alt="Preview">
                        <button type="button" class="remove-image" onclick="removeImage(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    imagePreview.appendChild(previewItem);
                });
            }
            
            // Cambiar título
            const pageHeader = document.querySelector('.page-header h2');
            if (pageHeader) {
                pageHeader.textContent = 'Editar Espacio';
            }
            
            // Cambiar texto del botón
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Espacio';
            }
        }
    }
}

// Funciones para Editar Espacios
function loadEditSpaces() {
    const spaces = getData('spaces') || [];
    const spacesList = document.getElementById('edit-spaces-list');
    const noSpaces = document.getElementById('no-spaces-edit');
    
    if (!spacesList) return;
    
    if (spaces.length === 0) {
        spacesList.innerHTML = '';
        if (noSpaces) noSpaces.style.display = 'block';
        return;
    }
    
    if (noSpaces) noSpaces.style.display = 'none';
    
    let spacesHTML = '';
    spaces.forEach(space => {
        spacesHTML += createSpaceItem(space, true);
    });
    
    spacesList.innerHTML = spacesHTML;
}

function filterEditSpaces() {
    const searchTerm = document.getElementById('search-edit-spaces').value.toLowerCase();
    const spaceItems = document.querySelectorAll('#edit-spaces-list .space-item');
    
    spaceItems.forEach(item => {
        const spaceName = item.querySelector('.space-name').textContent.toLowerCase();
        const spaceType = item.querySelector('.space-type').textContent.toLowerCase();
        
        if (spaceName.includes(searchTerm) || spaceType.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Funciones para Ver Espacios
function loadViewSpaces() {
    const spaces = getData('spaces') || [];
    const spacesList = document.getElementById('view-spaces-list');
    const noSpaces = document.getElementById('no-spaces-view');
    
    if (!spacesList) return;
    
    if (spaces.length === 0) {
        spacesList.innerHTML = '';
        if (noSpaces) noSpaces.style.display = 'block';
        return;
    }
    
    if (noSpaces) noSpaces.style.display = 'none';
    
    let spacesHTML = '';
    spaces.forEach(space => {
        spacesHTML += createSpaceItem(space, false);
    });
    
    spacesList.innerHTML = spacesHTML;
}

function loadStats() {
    const spaces = getData('spaces') || [];
    const totalSpaces = document.getElementById('total-spaces');
    const premiumSpaces = document.getElementById('premium-spaces');
    
    if (totalSpaces) {
        totalSpaces.textContent = spaces.length;
    }
    
    if (premiumSpaces) {
        const premiumCount = spaces.filter(space => space.category === 'premium').length;
        premiumSpaces.textContent = premiumCount;
    }
}

function filterViewSpaces() {
    const searchTerm = document.getElementById('search-view-spaces').value.toLowerCase();
    const spaceItems = document.querySelectorAll('#view-spaces-list .space-item');
    
    spaceItems.forEach(item => {
        const spaceName = item.querySelector('.space-name').textContent.toLowerCase();
        const spaceType = item.querySelector('.space-type').textContent.toLowerCase();
        
        if (spaceName.includes(searchTerm) || spaceType.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Función auxiliar para crear items de espacio
function createSpaceItem(space, showActions = true) {
    const typeLabels = {
        'salon': 'Salón de Eventos',
        'cancha': 'Cancha Deportiva',
        'piscina': 'Piscina',
        'quincho': 'Quincho/Parilla',
        'sala': 'Sala de Reuniones',
        'gimnasio': 'Gimnasio',
        'otro': 'Otro'
    };
    
    const categoryLabels = {
        'premium': 'Premium',
        'estandar': 'Estándar',
        'basico': 'Básico'
    };
    
    let imagesHTML = '';
    if (space.images && space.images.length > 0) {
        imagesHTML = `
            <div class="space-images">
                ${space.images.slice(0, 4).map(src => 
                    `<img src="${src}" alt="Imagen del espacio">`
                ).join('')}
                ${space.images.length > 4 ? `<div class="more-images">+${space.images.length - 4} más</div>` : ''}
            </div>
        `;
    }
    
    return `
        <div class="space-item" data-space-id="${space.id}">
            <div class="space-header">
                <div>
                    <h3 class="space-name">${space.name}</h3>
                    <div class="space-badges">
                        <span class="space-type">${typeLabels[space.type] || space.type}</span>
                        <span class="space-category ${space.category}">${categoryLabels[space.category] || space.category}</span>
                    </div>
                </div>
            </div>
            
            <div class="space-details">
                ${space.capacity ? `
                <div class="space-detail">
                    <i class="fas fa-users"></i>
                    <span>Capacidad: ${space.capacity} personas</span>
                </div>
                ` : ''}
                
                <div class="space-detail">
                    <i class="fas fa-dollar-sign"></i>
                    <span>Tarifa Normal: $${space.tariffNormal}</span>
                </div>
                
                <div class="space-detail">
                    <i class="fas fa-user-friends"></i>
                    <span>Tarifa Socio: $${space.tariffMember}</span>
                </div>
            </div>
            
            ${space.description ? `
            <div class="space-description">
                <p>${space.description}</p>
            </div>
            ` : ''}
            
            ${imagesHTML}
            
            ${showActions ? `
            <div class="space-actions">
                <button class="btn-edit" onclick="editSpace(${space.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteSpace(${space.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
            ` : ''}
        </div>
    `;
}

function editSpace(spaceId) {
    window.location.href = `espacios.html?edit=${spaceId}`;
}

function deleteSpace(spaceId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este espacio?')) {
        return;
    }
    
    const spaces = getData('spaces') || [];
    const updatedSpaces = spaces.filter(s => s.id !== spaceId);
    
    if (setData('spaces', updatedSpaces)) {
        showMessage('Espacio eliminado correctamente', 'success');
        // Recargar la lista
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'editar-espacios.html') {
            loadEditSpaces();
        } else if (currentPage === 'ver-espacios.html') {
            loadViewSpaces();
            loadStats();
        }
    } else {
        showMessage('Error al eliminar el espacio', 'error');
    }
}

// FUNCIONES DE PROTECCIÓN Y AUTENTICACIÓN
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

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'admin.html';
}

// Funciones de utilidad para localStorage
function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        console.error('Error al leer datos:', error);
        return null;
    }
}

function setData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        return false;
    }
}

function showMessage(message, type) {
    // Eliminar mensajes anteriores
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Agregar animación CSS para mensajes si no existe
if (!document.querySelector('#message-styles')) {
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .more-images {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.5rem;
            text-align: center;
            border-radius: 5px;
            font-size: 0.8rem;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
}

// Hacer funciones disponibles globalmente
window.removeImage = removeImage;
window.clearImages = clearImages;
window.resetForm = resetForm;
window.logout = logout;
window.editSpace = editSpace;
window.deleteSpace = deleteSpace;