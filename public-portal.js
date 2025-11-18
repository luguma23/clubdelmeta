// public-portal.js - Funcionalidades del portal público
document.addEventListener('DOMContentLoaded', function() {
    initializePublicPortal();
});

function initializePublicPortal() {
    // Cargar espacios disponibles
    loadPublicSpaces();
    
    // Configurar formularios
    setupQuoteForm();
    setupReservationForm();
    
    // Configurar navegación suave
    setupSmoothScrolling();
    
    // Actualizar estadísticas
    updatePublicStats();
}

function loadPublicSpaces() {
    const spaces = getData('spaces') || [];
    const spacesGrid = document.getElementById('public-spaces-grid');
    const noSpaces = document.getElementById('no-spaces-public');
    const quoteSelect = document.getElementById('quote-space');
    const reserveSelect = document.getElementById('reserve-space');
    const totalSpacesCount = document.getElementById('total-spaces-count');
    
    // Actualizar contador de espacios
    if (totalSpacesCount) {
        const activeSpaces = spaces.filter(space => space.active).length;
        totalSpacesCount.textContent = activeSpaces;
    }
    
    if (spaces.length === 0) {
        if (spacesGrid) spacesGrid.innerHTML = '';
        if (noSpaces) noSpaces.style.display = 'block';
        return;
    }
    
    if (noSpaces) noSpaces.style.display = 'none';
    
    // Mostrar espacios en la grilla
    let spacesHTML = '';
    spaces.forEach(space => {
        if (!space.active) return;
        
        const typeLabels = {
            'salon': 'Salón de Eventos',
            'cancha': 'Cancha Deportiva',
            'piscina': 'Piscina',
            'quincho': 'Quincho/Parilla',
            'sala': 'Sala de Reuniones',
            'gimnasio': 'Gimnasio',
            'otro': 'Otro'
        };
        
        const typeIcons = {
            'salon': 'fas fa-building',
            'cancha': 'fas fa-futbol',
            'piscina': 'fas fa-swimming-pool',
            'quincho': 'fas fa-fire',
            'sala': 'fas fa-users',
            'gimnasio': 'fas fa-dumbbell',
            'otro': 'fas fa-map-marker-alt'
        };
        
        // Usar imagen si existe, sino usar icono
        let imageHTML = '';
        if (space.images && space.images.length > 0) {
            imageHTML = `<img src="${space.images[0]}" alt="${space.name}" class="space-image">`;
        } else {
            imageHTML = `
                <div class="space-image">
                    <i class="${typeIcons[space.type] || 'fas fa-map-marker-alt'}"></i>
                </div>
            `;
        }
        
        spacesHTML += `
            <div class="space-card-public">
                ${imageHTML}
                <div class="space-content">
                    <h3 class="space-title">${space.name}</h3>
                    <span class="space-type">${typeLabels[space.type] || space.type}</span>
                    <p class="space-description">${space.description || 'Espacio perfecto para tu evento.'}</p>
                    
                    <div class="space-details">
                        ${space.capacity ? `
                        <div class="space-detail">
                            <i class="fas fa-users"></i>
                            <span>Capacidad: ${space.capacity} personas</span>
                        </div>
                        ` : ''}
                        <div class="space-detail">
                            <i class="fas fa-clock"></i>
                            <span>Disponible todo el día</span>
                        </div>
                    </div>
                    
                    <div class="space-price">
                        <div class="price-normal">$${space.tariffNormal}/hora</div>
                        <div class="price-member">Socios: $${space.tariffMember}/hora</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    if (spacesGrid) {
        spacesGrid.innerHTML = spacesHTML;
    }
    
    // Llenar selects de formularios
    let optionsHTML = '<option value="">Selecciona un espacio</option>';
    spaces.forEach(space => {
        if (space.active) {
            optionsHTML += `<option value="${space.id}" data-normal="${space.tariffNormal}" data-member="${space.tariffMember}">${space.name}</option>`;
        }
    });
    
    if (quoteSelect) quoteSelect.innerHTML = optionsHTML;
    if (reserveSelect) reserveSelect.innerHTML = optionsHTML;
}

function setupQuoteForm() {
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateQuoteDisplay();
        });
    }
    
    // Actualizar cotización cuando cambien los campos
    const quoteInputs = ['quote-space', 'quote-date', 'quote-hours', 'quote-member'];
    quoteInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', updateQuoteDisplay);
        }
    });
}

function setupReservationForm() {
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }
}

function updateQuoteDisplay() {
    const spaceSelect = document.getElementById('quote-space');
    const hoursSelect = document.getElementById('quote-hours');
    const memberCheckbox = document.getElementById('quote-member');
    const quoteDisplay = document.getElementById('quote-display');
    
    if (!spaceSelect || !hoursSelect || !memberCheckbox || !quoteDisplay) return;
    
    const selectedOption = spaceSelect.options[spaceSelect.selectedIndex];
    const hours = parseInt(hoursSelect.value);
    
    if (!selectedOption.value || !hours) {
        quoteDisplay.innerHTML = `
            <div class="quote-placeholder">
                <i class="fas fa-calculator"></i>
                <p>Completa el formulario para ver tu cotización</p>
            </div>
        `;
        return;
    }
    
    const normalRate = parseFloat(selectedOption.dataset.normal);
    const memberRate = parseFloat(selectedOption.dataset.member);
    const isMember = memberCheckbox.checked;
    const rate = isMember ? memberRate : normalRate;
    const total = rate * hours;
    
    const discount = isMember ? normalRate * hours - total : 0;
    
    quoteDisplay.innerHTML = `
        <div class="quote-result-content">
            <div class="quote-result-item">
                <span>Tarifa por hora:</span>
                <span>$${rate.toFixed(2)}</span>
            </div>
            <div class="quote-result-item">
                <span>Horas solicitadas:</span>
                <span>${hours} horas</span>
            </div>
            ${isMember ? `
            <div class="quote-result-item" style="color: #27ae60;">
                <span>Descuento socio:</span>
                <span>-$${discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="quote-result-item quote-total">
                <span>Total a pagar:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            ${isMember ? `
            <div class="quote-note" style="margin-top: 1rem; padding: 1rem; background: #d4edda; border-radius: 8px; color: #155724;">
                <i class="fas fa-check-circle"></i> Aplicado descuento especial para socios
            </div>
            ` : `
            <div class="quote-note" style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 8px; color: #856404;">
                <i class="fas fa-info-circle"></i> ¿Eres socio? Marca la casilla para obtener descuentos
            </div>
            `}
        </div>
    `;
}

function handleReservationSubmit(e) {
    e.preventDefault();
    
    const reservationData = {
        spaceId: document.getElementById('reserve-space').value,
        spaceName: document.getElementById('reserve-space').options[document.getElementById('reserve-space').selectedIndex].text,
        date: document.getElementById('reserve-date').value,
        startTime: document.getElementById('reserve-start').value,
        endTime: document.getElementById('reserve-end').value,
        eventType: document.getElementById('reserve-type').value,
        name: document.getElementById('reserve-name').value,
        phone: document.getElementById('reserve-phone').value,
        email: document.getElementById('reserve-email').value,
        isMember: document.getElementById('reserve-member').checked,
        guests: document.getElementById('reserve-guests').value,
        notes: document.getElementById('reserve-notes').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Validar campos requeridos
    if (!reservationData.spaceId || !reservationData.date || !reservationData.startTime || 
        !reservationData.endTime || !reservationData.name || !reservationData.phone || !reservationData.email) {
        showPublicMessage('Por favor, completa todos los campos requeridos', 'error');
        return;
    }
    
    // Guardar reserva
    const reservations = getData('reservations') || [];
    const newId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
    reservationData.id = newId;
    reservations.push(reservationData);
    
    if (setData('reservations', reservations)) {
        showPublicMessage('¡Solicitud de reserva enviada correctamente! Te contactaremos pronto.', 'success');
        resetReservationForm();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        showPublicMessage('Error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
    }
}

function resetReservationForm() {
    const form = document.getElementById('reservation-form');
    if (form) {
        form.reset();
    }
}

function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.public-nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function updatePublicStats() {
    const spaces = getData('spaces') || [];
    const activeSpaces = spaces.filter(space => space.active).length;
    
    const totalSpacesCount = document.getElementById('total-spaces-count');
    if (totalSpacesCount) {
        totalSpacesCount.textContent = activeSpaces;
    }
}

function showPublicMessage(message, type) {
    const existingMessage = document.querySelector('.public-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `public-message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
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

// Hacer funciones disponibles globalmente
window.resetReservationForm = resetReservationForm;