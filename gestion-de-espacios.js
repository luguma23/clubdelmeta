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
    
    // Configurar servicios adicionales si estamos en la página pública
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        setupPublicServices();
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

// Configurar servicios públicos
function setupPublicServices() {
    // Configurar eventos para cotización
    setupQuoteServices();
    
    // Configurar eventos para reservas
    setupReservationServices();
    
    // Cargar espacios en el portal público
    loadPublicSpaces();
}

// Funciones para servicios públicos
function setupQuoteServices() {
    // Sillas
    document.querySelectorAll('input[name="quote-chairs"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const quantityDiv = document.getElementById('quote-chairs-quantity');
            if (this.value !== 'none') {
                quantityDiv.style.display = 'block';
            } else {
                quantityDiv.style.display = 'none';
            }
            calculateQuote();
        });
    });
    
    // Mesas
    document.querySelectorAll('input[name="quote-tables"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const quantityDiv = document.getElementById('quote-tables-quantity');
            if (this.value !== 'none') {
                quantityDiv.style.display = 'block';
            } else {
                quantityDiv.style.display = 'none';
            }
            calculateQuote();
        });
    });
    
    // Mantelería
    document.querySelectorAll('input[name="quote-linens"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const quantityDiv = document.getElementById('quote-linens-quantity');
            if (this.value !== 'none') {
                quantityDiv.style.display = 'block';
            } else {
                quantityDiv.style.display = 'none';
            }
            calculateQuote();
        });
    });
    
    // Meseros
    document.querySelectorAll('input[name="quote-waiters"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const quantityDiv = document.getElementById('quote-waiters-quantity');
            if (this.value !== 'none') {
                quantityDiv.style.display = 'block';
                updateWaitersCount('quote');
            } else {
                quantityDiv.style.display = 'none';
            }
            calculateQuote();
        });
    });
    
    // Cantidades
    const chairsCount = document.getElementById('quote-chairs-count');
    const tablesCount = document.getElementById('quote-tables-count');
    const linensCount = document.getElementById('quote-linens-count');
    
    if (chairsCount) chairsCount.addEventListener('input', calculateQuote);
    if (tablesCount) tablesCount.addEventListener('input', calculateQuote);
    if (linensCount) linensCount.addEventListener('input', calculateQuote);
    
    // Invitados
    const quoteGuests = document.getElementById('quote-guests');
    if (quoteGuests) {
        quoteGuests.addEventListener('input', function() {
            updateWaitersCount('quote');
            calculateQuote();
        });
    }
    
    // Socio
    const quoteMember = document.getElementById('quote-member');
    if (quoteMember) {
        quoteMember.addEventListener('change', calculateQuote);
    }
    
    // Formulario de cotización
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateQuote();
        });
    }
}

function setupReservationServices() {
    // Invitados
    const reserveGuests = document.getElementById('reserve-guests');
    if (reserveGuests) {
        reserveGuests.addEventListener('input', function() {
            updateSuggestedQuantities();
            updateWaitersCount('reserve');
            calculateReservationTotal();
        });
    }
    
    // Meseros
    document.querySelectorAll('input[name="waiters"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const quantityDiv = document.getElementById('waiters-quantity');
            if (this.value !== 'none') {
                quantityDiv.style.display = 'block';
                updateWaitersCount('reserve');
            } else {
                quantityDiv.style.display = 'none';
            }
            calculateReservationTotal();
        });
    });
    
    // Configurar eventos para servicios adicionales en reservas
    setupServiceOptions('chairs');
    setupServiceOptions('tables');
    setupServiceOptions('linens');
    setupServiceOptions('waiters');
    
    // Formulario de reserva
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }
}

function setupServiceOptions(serviceType) {
    document.querySelectorAll(`input[name="${serviceType}"]`).forEach(radio => {
        radio.addEventListener('change', function() {
            const quantityDiv = document.getElementById(`${serviceType}-quantity`);
            if (this.value !== 'none') {
                quantityDiv.style.display = 'block';
            } else {
                quantityDiv.style.display = 'none';
            }
            calculateReservationTotal();
        });
    });
    
    const countInput = document.getElementById(`${serviceType}-count`);
    if (countInput) {
        countInput.addEventListener('input', calculateReservationTotal);
    }
}

function updateWaitersCount(type) {
    const guestsInput = document.getElementById(`${type}-guests`);
    const waitersCountInput = document.getElementById(`${type}-waiters-count`);
    
    if (guestsInput && waitersCountInput) {
        const guests = parseInt(guestsInput.value) || 0;
        const waitersCount = Math.ceil(guests / 24);
        waitersCountInput.value = waitersCount;
    }
}

function updateSuggestedQuantities() {
    const guests = parseInt(document.getElementById('reserve-guests').value) || 0;
    const suggestedQuantities = document.getElementById('suggested-quantities');
    
    if (guests > 0) {
        suggestedQuantities.style.display = 'block';
        document.getElementById('suggested-chairs').textContent = guests;
        document.getElementById('suggested-tables').textContent = Math.ceil(guests / 4);
        document.getElementById('suggested-tablecloths').textContent = Math.ceil(guests / 4);
        document.getElementById('suggested-waiters').textContent = Math.ceil(guests / 24);
    } else {
        suggestedQuantities.style.display = 'none';
    }
}

function calculateQuote() {
    const spaceSelect = document.getElementById('quote-space');
    const hoursSelect = document.getElementById('quote-hours');
    const guestsInput = document.getElementById('quote-guests');
    const isMember = document.getElementById('quote-member').checked;
    
    if (!spaceSelect.value || !hoursSelect.value || !guestsInput.value) {
        return;
    }
    
    const spaces = getData('spaces') || [];
    const selectedSpace = spaces.find(s => s.id === parseInt(spaceSelect.value));
    
    if (!selectedSpace) {
        return;
    }
    
    let total = 0;
    const details = [];
    
    // Costo base del espacio
    const spaceCost = selectedSpace.tariffNormal * parseInt(hoursSelect.value);
    total += spaceCost;
    details.push({
        name: `${selectedSpace.name} (${hoursSelect.value} horas)`,
        amount: spaceCost
    });
    
    // Servicios adicionales
    const servicesTotal = calculateServicesTotal('quote');
    total += servicesTotal;
    
    // Aplicar descuento de socio
    if (isMember) {
        const discount = total * 0.1;
        details.push({
            name: 'Descuento Socio (10%)',
            amount: -discount
        });
        total -= discount;
    }
    
    // Mostrar resultado
    displayQuoteResult(details, total);
}

function calculateReservationTotal() {
    const servicesTotal = calculateServicesTotal('reserve');
    const servicesSummary = document.getElementById('services-summary');
    const servicesTotalElement = document.getElementById('services-total');
    
    if (servicesTotal > 0) {
        servicesSummary.style.display = 'block';
        servicesTotalElement.textContent = servicesTotal.toLocaleString();
        
        // Actualizar items del resumen
        updateServicesSummary();
    } else {
        servicesSummary.style.display = 'none';
    }
}

function calculateServicesTotal(prefix) {
    let total = 0;
    
    // Sillas
    const chairsRadio = document.querySelector(`input[name="${prefix}-chairs"]:checked`);
    if (chairsRadio && chairsRadio.value !== 'none') {
        const chairsCount = parseInt(document.getElementById(`${prefix}-chairs-count`).value) || 0;
        const chairPrice = getServicePrice(chairsRadio.value, 'chairs');
        total += chairsCount * chairPrice;
    }
    
    // Mesas
    const tablesRadio = document.querySelector(`input[name="${prefix}-tables"]:checked`);
    if (tablesRadio && tablesRadio.value !== 'none') {
        const tablesCount = parseInt(document.getElementById(`${prefix}-tables-count`).value) || 0;
        const tablePrice = getServicePrice(tablesRadio.value, 'tables');
        total += tablesCount * tablePrice;
    }
    
    // Mantelería
    const linensRadio = document.querySelector(`input[name="${prefix}-linens"]:checked`);
    if (linensRadio && linensRadio.value !== 'none') {
        const linensCount = parseInt(document.getElementById(`${prefix}-linens-count`).value) || 0;
        const linenPrice = getServicePrice(linensRadio.value, 'linens');
        total += linensCount * linenPrice;
    }
    
    // Meseros
    const waitersRadio = document.querySelector(`input[name="${prefix}-waiters"]:checked`);
    if (waitersRadio && waitersRadio.value !== 'none') {
        const waitersCount = parseInt(document.getElementById(`${prefix}-waiters-count`).value) || 0;
        const waiterPrice = getServicePrice(waitersRadio.value, 'waiters');
        total += waitersCount * waiterPrice;
    }
    
    return total;
}

function getServicePrice(serviceType, category) {
    const prices = {
        'chairs': {
            'rimax': 800,
            'tifany': 5000
        },
        'tables': {
            'standard': 6000
        },
        'linens': {
            'forros': 2500,
            'manteleria': 10000,
            'cubremantel': 6000
        },
        'waiters': {
            'solicitar': 130000
        }
    };
    
    return prices[category]?.[serviceType] || 0;
}

function updateServicesSummary() {
    const summaryItems = document.getElementById('summary-items');
    let html = '';
    
    // Sillas
    const chairsRadio = document.querySelector('input[name="chairs"]:checked');
    if (chairsRadio && chairsRadio.value !== 'none') {
        const chairsCount = parseInt(document.getElementById('chairs-count').value) || 0;
        const chairPrice = getServicePrice(chairsRadio.value, 'chairs');
        html += `
            <div class="summary-item">
                <span>Sillas ${chairsRadio.value === 'rimax' ? 'Rimax' : 'Tiffany'} (${chairsCount})</span>
                <span>$${(chairsCount * chairPrice).toLocaleString()}</span>
            </div>
        `;
    }
    
    // Mesas
    const tablesRadio = document.querySelector('input[name="tables"]:checked');
    if (tablesRadio && tablesRadio.value !== 'none') {
        const tablesCount = parseInt(document.getElementById('tables-count').value) || 0;
        const tablePrice = getServicePrice(tablesRadio.value, 'tables');
        html += `
            <div class="summary-item">
                <span>Mesas Standard (${tablesCount})</span>
                <span>$${(tablesCount * tablePrice).toLocaleString()}</span>
            </div>
        `;
    }
    
    // Mantelería
    const linensRadio = document.querySelector('input[name="linens"]:checked');
    if (linensRadio && linensRadio.value !== 'none') {
        const linensCount = parseInt(document.getElementById('linens-count').value) || 0;
        const linenPrice = getServicePrice(linensRadio.value, 'linens');
        const serviceName = getLinenServiceName(linensRadio.value);
        html += `
            <div class="summary-item">
                <span>${serviceName} (${linensCount})</span>
                <span>$${(linensCount * linenPrice).toLocaleString()}</span>
            </div>
        `;
    }
    
    // Meseros
    const waitersRadio = document.querySelector('input[name="waiters"]:checked');
    if (waitersRadio && waitersRadio.value !== 'none') {
        const waitersCount = parseInt(document.getElementById('waiters-count').value) || 0;
        const waiterPrice = getServicePrice(waitersRadio.value, 'waiters');
        html += `
            <div class="summary-item">
                <span>Meseros (${waitersCount})</span>
                <span>$${(waitersCount * waiterPrice).toLocaleString()}</span>
            </div>
        `;
    }
    
    summaryItems.innerHTML = html;
}

function getLinenServiceName(type) {
    const names = {
        'forros': 'Forros para sillas',
        'manteleria': 'Mantelería completa',
        'cubremantel': 'Cubre mantel'
    };
    return names[type] || type;
}

function displayQuoteResult(details, total) {
    const quoteDisplay = document.getElementById('quote-display');
    let html = '<div class="quote-details">';
    
    details.forEach(item => {
        html += `
            <div class="quote-result-item">
                <span>${item.name}</span>
                <span>$${item.amount.toLocaleString()}</span>
            </div>
        `;
    });
    
    html += `
        <div class="quote-total">
            <span>Total</span>
            <span>$${total.toLocaleString()}</span>
        </div>
    </div>`;
    
    quoteDisplay.innerHTML = html;
}

function handleReservationSubmit(e) {
    e.preventDefault();
    
    const reservationData = {
        spaceId: document.getElementById('reserve-space').value,
        date: document.getElementById('reserve-date').value,
        startTime: document.getElementById('reserve-start').value,
        endTime: document.getElementById('reserve-end').value,
        eventType: document.getElementById('reserve-type').value,
        guests: parseInt(document.getElementById('reserve-guests').value),
        name: document.getElementById('reserve-name').value,
        phone: document.getElementById('reserve-phone').value,
        email: document.getElementById('reserve-email').value,
        isMember: document.getElementById('reserve-member').checked,
        services: getSelectedServices(),
        createdAt: new Date().toISOString()
    };
    
    if (validateReservation(reservationData)) {
        saveReservation(reservationData);
    }
}

function getSelectedServices() {
    const services = {};
    
    // Sillas
    const chairsRadio = document.querySelector('input[name="chairs"]:checked');
    if (chairsRadio && chairsRadio.value !== 'none') {
        services.chairs = {
            type: chairsRadio.value,
            quantity: parseInt(document.getElementById('chairs-count').value) || 0,
            price: getServicePrice(chairsRadio.value, 'chairs')
        };
    }
    
    // Mesas
    const tablesRadio = document.querySelector('input[name="tables"]:checked');
    if (tablesRadio && tablesRadio.value !== 'none') {
        services.tables = {
            type: tablesRadio.value,
            quantity: parseInt(document.getElementById('tables-count').value) || 0,
            price: getServicePrice(tablesRadio.value, 'tables')
        };
    }
    
    // Mantelería
    const linensRadio = document.querySelector('input[name="linens"]:checked');
    if (linensRadio && linensRadio.value !== 'none') {
        services.linens = {
            type: linensRadio.value,
            quantity: parseInt(document.getElementById('linens-count').value) || 0,
            price: getServicePrice(linensRadio.value, 'linens')
        };
    }
    
    // Meseros
    const waitersRadio = document.querySelector('input[name="waiters"]:checked');
    if (waitersRadio && waitersRadio.value !== 'none') {
        services.waiters = {
            type: waitersRadio.value,
            quantity: parseInt(document.getElementById('waiters-count').value) || 0,
            price: getServicePrice(waitersRadio.value, 'waiters')
        };
    }
    
    return services;
}

function validateReservation(data) {
    if (!data.spaceId) {
        showMessage('Por favor selecciona un espacio', 'error');
        return false;
    }
    
    if (!data.date || !data.startTime || !data.endTime) {
        showMessage('Por favor completa la fecha y hora del evento', 'error');
        return false;
    }
    
    if (!data.guests || data.guests < 1) {
        showMessage('Por favor ingresa el número de invitados', 'error');
        return false;
    }
    
    if (!data.name || !data.phone || !data.email) {
        showMessage('Por favor completa tu información personal', 'error');
        return false;
    }
    
    return true;
}

function saveReservation(reservationData) {
    const reservations = getData('reservations') || [];
    const newId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
    
    const newReservation = {
        id: newId,
        ...reservationData,
        status: 'pending'
    };
    
    reservations.push(newReservation);
    
    if (setData('reservations', reservations)) {
        showMessage('Reserva enviada correctamente. Te contactaremos pronto.', 'success');
        resetReservationForm();
    } else {
        showMessage('Error al enviar la reserva', 'error');
    }
}

function resetReservationForm() {
    const form = document.getElementById('reservation-form');
    if (form) {
        form.reset();
        document.getElementById('suggested-quantities').style.display = 'none';
        document.getElementById('services-summary').style.display = 'none';
        
        // Ocultar todos los selectores de cantidad
        document.querySelectorAll('.quantity-selector').forEach(el => {
            el.style.display = 'none';
        });
        
        // Resetear radios a "none"
        document.querySelectorAll('input[value="none"]').forEach(radio => {
            radio.checked = true;
        });
    }
}

// Cargar espacios en el portal público
function loadPublicSpaces() {
    const spaces = getData('spaces') || [];
    const spacesGrid = document.getElementById('public-spaces-grid');
    const noSpaces = document.getElementById('no-spaces-public');
    const totalSpacesCount = document.getElementById('total-spaces-count');
    const quoteSpaceSelect = document.getElementById('quote-space');
    const reserveSpaceSelect = document.getElementById('reserve-space');
    
    if (totalSpacesCount) {
        totalSpacesCount.textContent = spaces.length;
    }
    
    if (spaces.length === 0) {
        if (spacesGrid) spacesGrid.innerHTML = '';
        if (noSpaces) noSpaces.style.display = 'block';
        if (quoteSpaceSelect) quoteSpaceSelect.innerHTML = '<option value="">No hay espacios disponibles</option>';
        if (reserveSpaceSelect) reserveSpaceSelect.innerHTML = '<option value="">No hay espacios disponibles</option>';
        return;
    }
    
    if (noSpaces) noSpaces.style.display = 'none';
    
    // Actualizar grid de espacios
    if (spacesGrid) {
        let spacesHTML = '';
        spaces.forEach(space => {
            spacesHTML += createPublicSpaceCard(space);
        });
        spacesGrid.innerHTML = spacesHTML;
    }
    
    // Actualizar selects de espacios
    if (quoteSpaceSelect) {
        let optionsHTML = '<option value="">Selecciona un espacio</option>';
        spaces.forEach(space => {
            optionsHTML += `<option value="${space.id}">${space.name} - $${space.tariffNormal}/hora</option>`;
        });
        quoteSpaceSelect.innerHTML = optionsHTML;
    }
    
    if (reserveSpaceSelect) {
        let optionsHTML = '<option value="">Selecciona un espacio</option>';
        spaces.forEach(space => {
            optionsHTML += `<option value="${space.id}">${space.name}</option>`;
        });
        reserveSpaceSelect.innerHTML = optionsHTML;
    }
}

function createPublicSpaceCard(space) {
    const typeLabels = {
        'salon': 'Salón de Eventos',
        'cancha': 'Cancha Deportiva',
        'piscina': 'Piscina',
        'quincho': 'Quincho/Parilla',
        'sala': 'Sala de Reuniones',
        'gimnasio': 'Gimnasio',
        'otro': 'Otro'
    };
    
    return `
        <div class="space-card-public">
            <div class="space-image">
                <i class="fas fa-${getSpaceIcon(space.type)}"></i>
            </div>
            <div class="space-content">
                <h3 class="space-title">${space.name}</h3>
                <span class="space-type">${typeLabels[space.type] || space.type}</span>
                <p class="space-description">${space.description || 'Espacio perfecto para tu evento.'}</p>
                
                <div class="space-details">
                    ${space.capacity ? `
                    <div class="space-detail">
                        <i class="fas fa-users"></i>
                        <span>${space.capacity} personas</span>
                    </div>
                    ` : ''}
                    
                    <div class="space-detail">
                        <i class="fas fa-clock"></i>
                        <span>Por hora</span>
                    </div>
                </div>
                
                <div class="space-price">
                    <div class="price-normal">$${space.tariffNormal}/hora</div>
                    <div class="price-member">Socios: $${space.tariffMember}/hora</div>
                </div>
            </div>
        </div>
    `;
}

function getSpaceIcon(type) {
    const icons = {
        'salon': 'building',
        'cancha': 'futbol',
        'piscina': 'swimming-pool',
        'quincho': 'fire',
        'sala': 'users',
        'gimnasio': 'dumbbell',
        'otro': 'map-marker-alt'
    };
    return icons[type] || 'map-marker-alt';
}

// Funciones para Agregar Espacio (mantenidas del código original)
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
window.resetReservationForm = resetReservationForm;
window.calculateQuote = calculateQuote;
window.calculateReservationTotal = calculateReservationTotal;