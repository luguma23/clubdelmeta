// public-portal.js - Funcionalidades del portal público CON SELECTS CORREGIDO (BLOQUEAR LUNES)
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
    
    // Inicializar selects de servicios
    setupServiceSelects();
    
    // Configurar calendarios para bloquear lunes
    setupDateInputs();
}

function setupDateInputs() {
    // Configurar inputs de fecha para bloquear lunes
    const dateInputs = ['quote-date', 'reserve-date'];
    
    dateInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Establecer fecha mínima como hoy (evitar fechas pasadas)
            const today = new Date();
            input.min = today.toISOString().split('T')[0];
            
            // Agregar evento para validar fecha seleccionada
            input.addEventListener('change', function() {
                validateDateSelection(this);
            });
            
            // Agregar placeholder informativo
            input.setAttribute('placeholder', 'No disponible los lunes');
        }
    });
}

function validateDateSelection(dateInput) {
    if (!dateInput.value) return true; // Permitir campo vacío
    
    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    // Bloquear lunes (día 1) - PERMITIR todos los otros días
    if (dayOfWeek === 1) { // Si ES lunes
        showPublicMessage('Los lunes no están disponibles para reservas. Por favor, selecciona otro día de la semana.', 'error');
        dateInput.value = ''; // Limpiar la selección
        dateInput.focus(); // Enfocar el campo para nueva selección
        
        // Mostrar sugerencia: encontrar el próximo día disponible (martes)
        const nextAvailableDay = getNextAvailableDay();
        const formattedDate = nextAvailableDay.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        setTimeout(() => {
            showPublicMessage(`Próximo día disponible (martes): ${formattedDate}`, 'info');
        }, 1000);
        
        return false;
    }
    
    return true;
}

function getNextAvailableDay() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Si hoy es lunes, sugerir mañana (martes)
    // Si hoy es otro día, sugerir mañana (pero si mañana es lunes, sugerir el martes siguiente)
    let daysToAdd = 1;
    
    // Si mañana es lunes, saltar al martes
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (tomorrow.getDay() === 1) { // Si mañana es lunes
        daysToAdd = 2; // Saltar al martes
    }
    
    const nextAvailable = new Date(today);
    nextAvailable.setDate(today.getDate() + daysToAdd);
    return nextAvailable;
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
        animateCounter(totalSpacesCount, 0, activeSpaces, 1000);
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
                            <i class="fas fa-calendar-alt"></i>
                            <span>Disponible de martes a domingo</span>
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
            calculateQuote();
        });
    }
    
    // Configurar listeners para los selects de servicios
    const serviceSelects = ['quote-chairs', 'quote-tables', 'quote-linens', 'quote-waiters'];
    serviceSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.addEventListener('change', function() {
                // Ocultar contadores de cantidad (ya no se usan)
                const quantityContainer = document.getElementById(`${selectId}-quantity`);
                if (quantityContainer) {
                    quantityContainer.style.display = 'none';
                }
                calculateQuote();
            });
        }
    });
    
    // Actualizar cotización cuando cambien los campos
    const quoteInputs = ['quote-space', 'quote-date', 'quote-hours', 'quote-member', 'quote-guests'];
    quoteInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', calculateQuote);
        }
    });
    
    // Validar fecha en cotización
    const quoteDateInput = document.getElementById('quote-date');
    if (quoteDateInput) {
        quoteDateInput.addEventListener('change', function() {
            if (!validateDateSelection(this)) {
                // Limpiar otros campos si fecha no válida
                document.getElementById('quote-hours').value = '';
                document.getElementById('quote-guests').value = '';
                const quoteDisplay = document.getElementById('quote-display');
                if (quoteDisplay) {
                    quoteDisplay.innerHTML = `
                        <div class="quote-placeholder">
                            <i class="fas fa-calculator"></i>
                            <p>Completa el formulario para ver tu cotización</p>
                        </div>
                    `;
                }
            }
        });
    }
}

function setupReservationForm() {
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }
    
    // Configurar listeners para los selects de servicios en reservas
    const serviceSelects = ['reserve-chairs', 'reserve-tables', 'reserve-linens', 'reserve-waiters'];
    serviceSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.addEventListener('change', function() {
                // Ocultar contadores de cantidad (ya no se usan)
                const quantityContainer = document.getElementById(`${selectId}-quantity`);
                if (quantityContainer) {
                    quantityContainer.style.display = 'none';
                }
                updateServicesSummary();
            });
        }
    });
    
    // Actualizar sugerencias cuando cambien los invitados
    const guestsInput = document.getElementById('reserve-guests');
    if (guestsInput) {
        guestsInput.addEventListener('change', function() {
            updateSuggestedQuantities();
            updateServicesSummary();
        });
    }
    
    // Validar fecha en reservas
    const reserveDateInput = document.getElementById('reserve-date');
    if (reserveDateInput) {
        reserveDateInput.addEventListener('change', function() {
            if (!validateDateSelection(this)) {
                // Limpiar campos relacionados si fecha no válida
                document.getElementById('reserve-start').value = '';
                document.getElementById('reserve-end').value = '';
            }
        });
    }
}

function calculateQuote() {
    const spaceSelect = document.getElementById('quote-space');
    const hoursSelect = document.getElementById('quote-hours');
    const guestsInput = document.getElementById('quote-guests');
    const dateInput = document.getElementById('quote-date');
    const quoteDisplay = document.getElementById('quote-display');
    
    if (!spaceSelect || !hoursSelect || !quoteDisplay) return;
    
    // Validar fecha primero
    if (dateInput && dateInput.value) {
        if (!validateDateSelection(dateInput)) {
            return;
        }
    }
    
    const selectedOption = spaceSelect.options[spaceSelect.selectedIndex];
    const hoursValue = hoursSelect.value;
    
    // Determinar horas según la opción seleccionada - CAMBIO 3
    let hours = 0;
    let hoursText = '';
    if (hoursValue === "1") {
        hours = 4;  // CAMBIADO: de 1 a 4
        hoursText = "4 horas";
    } else if (hoursValue === "2") {
        hours = 8;  // CAMBIADO: de 2 a 8
        hoursText = "8 horas";
    }
    
    if (!selectedOption.value || !hours) {
        quoteDisplay.innerHTML = `
            <div class="quote-placeholder">
                <i class="fas fa-calculator"></i>
                <p>Completa el formulario para ver tu cotización</p>
            </div>
        `;
        return;
    }
    
    const guests = parseInt(guestsInput.value) || 0;
    
    // Calcular costo base del espacio
    const normalRate = parseFloat(selectedOption.dataset.normal);
    const memberRate = parseFloat(selectedOption.dataset.member);
    
    // CAMBIO 1: Validar si hay código de socio ingresado
    const isMember = document.getElementById('quote-member-code') ? 
                     document.getElementById('quote-member-code').value.trim().length > 0 : 
                     false;
    
    const spaceRate = isMember ? memberRate : normalRate;
    const spaceCost = spaceRate * hours;
    
    let breakdownHTML = `
        <div class="quote-result-item">
            <span>Tarifa por hora:</span>
            <span>$${spaceRate.toFixed(2)}</span>
        </div>
        <div class="quote-result-item">
            <span>Horas solicitadas:</span>
            <span>${hoursText}</span>
        </div>
        <div class="quote-result-item">
            <span>Costo del espacio:</span>
            <span>$${spaceCost.toFixed(2)}</span>
        </div>
    `;
    
    // Calcular servicios adicionales (sin contadores)
    let servicesCost = 0;
    const services = [];
    
    // Calcular cantidades basadas en invitados
    const chairsNeeded = guests; // 1 silla por invitado
    const tablesNeeded = Math.ceil(guests / 4); // 1 mesa cada 4 invitados
    const tableclothsNeeded = tablesNeeded; // 1 mantel por mesa
    
    // Sillas (solo si hay invitados y se seleccionó alguna opción)
    const chairsSelect = document.getElementById('quote-chairs');
    if (chairsSelect && chairsSelect.value !== 'none' && guests > 0) {
        const chairsPrice = parseFloat(chairsSelect.options[chairsSelect.selectedIndex].dataset.price);
        const chairsCost = chairsPrice * chairsNeeded;
        servicesCost += chairsCost;
        services.push({
            name: chairsSelect.options[chairsSelect.selectedIndex].text,
            quantity: chairsNeeded,
            cost: chairsCost
        });
    }
    
    // Mesas (solo si hay invitados y se seleccionó alguna opción)
    const tablesSelect = document.getElementById('quote-tables');
    if (tablesSelect && tablesSelect.value !== 'none' && guests > 0) {
        const tablesPrice = parseFloat(tablesSelect.options[tablesSelect.selectedIndex].dataset.price);
        const tablesCost = tablesPrice * tablesNeeded;
        servicesCost += tablesCost;
        services.push({
            name: tablesSelect.options[tablesSelect.selectedIndex].text,
            quantity: tablesNeeded,
            cost: tablesCost
        });
    }
    
    // Mantelería (solo si hay invitados y se seleccionó alguna opción)
    const linensSelect = document.getElementById('quote-linens');
    if (linensSelect && linensSelect.value !== 'none' && guests > 0) {
        const linensPrice = parseFloat(linensSelect.options[linensSelect.selectedIndex].dataset.price);
        
        // Determinar la unidad de medida
        let quantity = 0;
        let serviceName = linensSelect.options[linensSelect.selectedIndex].text;
        
        if (linensSelect.value === "forros") {
            quantity = chairsNeeded; // Forros para sillas: 1 por silla
        } else {
            quantity = tableclothsNeeded; // Mantelería: 1 por mesa
        }
        
        const linensCost = linensPrice * quantity;
        servicesCost += linensCost;
        services.push({
            name: serviceName,
            quantity: quantity,
            cost: linensCost
        });
    }
    
    // Meseros (solo si hay invitados y se seleccionó alguna opción)
    const waitersSelect = document.getElementById('quote-waiters');
    if (waitersSelect && waitersSelect.value !== 'none' && guests > 0) {
        const waitersNeeded = Math.max(1, Math.ceil(guests / 25)); // 1 mesero cada 25 invitados
        const waitersPrice = parseFloat(waitersSelect.options[waitersSelect.selectedIndex].dataset.price);
        const waitersCost = waitersPrice * waitersNeeded;
        servicesCost += waitersCost;
        services.push({
            name: `${waitersSelect.options[waitersSelect.selectedIndex].text} (${waitersNeeded})`,
            quantity: waitersNeeded,
            cost: waitersCost
        });
    }
    
    // Mostrar servicios en el desglose
    if (services.length > 0) {
        breakdownHTML += `
            <div class="quote-result-item" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                <span><strong>Servicios Adicionales:</strong></span>
                <span></span>
            </div>
        `;
        
        services.forEach(service => {
            breakdownHTML += `
                <div class="quote-result-item service-item">
                    <span>${service.name} x${service.quantity}</span>
                    <span>$${service.cost.toFixed(2)}</span>
                </div>
            `;
        });
        
        breakdownHTML += `
            <div class="quote-result-item">
                <span>Total servicios:</span>
                <span>$${servicesCost.toFixed(2)}</span>
            </div>
        `;
    }
    
    // Calcular total
    const subtotal = spaceCost + servicesCost;
    const discount = isMember ? subtotal * 0.1 : 0;
    const total = subtotal - discount;
    
    breakdownHTML += `
        <div class="quote-result-item" style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #ddd;">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
    `;
    
    if (isMember && discount > 0) {
        breakdownHTML += `
            <div class="quote-result-item" style="color: #27ae60;">
                <span>Descuento socio (10%):</span>
                <span>-$${discount.toFixed(2)}</span>
            </div>
        `;
    }
    
    breakdownHTML += `
        <div class="quote-result-item quote-total">
            <span><strong>Total a pagar:</strong></span>
            <span><strong>$${total.toFixed(2)}</strong></span>
        </div>
    `;
    
    // Nota sobre disponibilidad
    if (dateInput && dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek !== 1) {
            breakdownHTML += `
                <div class="quote-note" style="background: #d4edda; color: #155724;">
                    <i class="fas fa-calendar-check"></i> Fecha disponible confirmada
                </div>
            `;
        }
    }
    
    quoteDisplay.innerHTML = `
        <div class="quote-result-content">
            ${breakdownHTML}
        </div>
    `;
}

function updateSuggestedQuantities() {
    const guestsInput = document.getElementById('reserve-guests');
    const suggestedSection = document.getElementById('suggested-quantities');
    
    if (!guestsInput || !suggestedSection) return;
    
    const guests = parseInt(guestsInput.value) || 0;
    
    if (guests > 0) {
        // Mostrar sección
        suggestedSection.style.display = 'block';
        
        // Calcular sugerencias según nuevas reglas
        const suggestedChairs = guests; // 1 silla por invitado
        const suggestedTables = Math.ceil(guests / 4); // 1 mesa cada 4 invitados
        const suggestedTablecloths = suggestedTables; // 1 mantel por mesa
        const suggestedWaiters = Math.max(1, Math.ceil(guests / 25)); // 1 mesero cada 25 invitados
        
        // Actualizar valores
        document.getElementById('suggested-chairs').textContent = suggestedChairs;
        document.getElementById('suggested-tables').textContent = suggestedTables;
        document.getElementById('suggested-tablecloths').textContent = suggestedTablecloths;
        document.getElementById('suggested-waiters').textContent = suggestedWaiters;
        
    } else {
        suggestedSection.style.display = 'none';
    }
}

function updateServicesSummary() {
    const guestsInput = document.getElementById('reserve-guests');
    const servicesSummary = document.getElementById('services-summary');
    const summaryItems = document.getElementById('summary-items');
    const servicesTotal = document.getElementById('services-total');
    
    if (!guestsInput || !servicesSummary || !summaryItems || !servicesTotal) return;
    
    const guests = parseInt(guestsInput.value) || 0;
    
    if (guests === 0) {
        servicesSummary.style.display = 'none';
        return;
    }
    
    // Calcular cantidades basadas en invitados
    const chairsNeeded = guests; // 1 silla por invitado
    const tablesNeeded = Math.ceil(guests / 4); // 1 mesa cada 4 invitados
    const tableclothsNeeded = tablesNeeded; // 1 mantel por mesa
    
    let servicesHTML = '';
    let total = 0;
    
    // Verificar cada servicio
    const services = [
        { id: 'reserve-chairs', name: 'Sillas', quantity: chairsNeeded },
        { id: 'reserve-tables', name: 'Mesas', quantity: tablesNeeded }
    ];
    
    services.forEach(service => {
        const select = document.getElementById(service.id);
        if (select && select.value !== 'none') {
            const price = parseFloat(select.options[select.selectedIndex].dataset.price);
            const cost = price * service.quantity;
            total += cost;
            
            servicesHTML += `
                <div class="summary-item">
                    <span>${select.options[select.selectedIndex].text} x${service.quantity}</span>
                    <span>$${cost.toFixed(2)}</span>
                </div>
            `;
        }
    });
    
    // Mantelería especial (depende del tipo seleccionado)
    const linensSelect = document.getElementById('reserve-linens');
    if (linensSelect && linensSelect.value !== 'none') {
        const linensPrice = parseFloat(linensSelect.options[linensSelect.selectedIndex].dataset.price);
        let quantity = 0;
        let serviceName = linensSelect.options[linensSelect.selectedIndex].text;
        
        if (linensSelect.value === "forros") {
            quantity = chairsNeeded; // Forros para sillas: 1 por silla
        } else {
            quantity = tableclothsNeeded; // Mantelería: 1 por mesa
        }
        
        const linensCost = linensPrice * quantity;
        total += linensCost;
        servicesHTML += `
            <div class="summary-item">
                <span>${serviceName} x${quantity}</span>
                <span>$${linensCost.toFixed(2)}</span>
            </div>
        `;
    }
    
    // Meseros
    const waitersSelect = document.getElementById('reserve-waiters');
    if (waitersSelect && waitersSelect.value !== 'none') {
        const waitersNeeded = Math.max(1, Math.ceil(guests / 25)); // 1 mesero cada 25 invitados
        const waitersPrice = parseFloat(waitersSelect.options[waitersSelect.selectedIndex].dataset.price);
        const waitersCost = waitersPrice * waitersNeeded;
        total += waitersCost;
        servicesHTML += `
            <div class="summary-item">
                <span>${waitersSelect.options[waitersSelect.selectedIndex].text} (${waitersNeeded})</span>
                <span>$${waitersCost.toFixed(2)}</span>
            </div>
        `;
    }
    
    if (servicesHTML) {
        servicesSummary.style.display = 'block';
        summaryItems.innerHTML = servicesHTML;
        servicesTotal.textContent = total.toFixed(2);
    } else {
        servicesSummary.style.display = 'none';
    }
}

function handleReservationSubmit(e) {
    e.preventDefault();
    
    // Validar fecha primero
    const dateInput = document.getElementById('reserve-date');
    if (dateInput && dateInput.value) {
        if (!validateDateSelection(dateInput)) {
            return;
        }
    }
    
    // Validar formulario completo
    if (!validateReservationForm()) {
        showPublicMessage('Por favor, completa todos los campos requeridos correctamente', 'error');
        return;
    }
    
    // Obtener datos del formulario
    const reservationData = {
        id: generateId(),
        spaceId: document.getElementById('reserve-space').value,
        spaceName: document.getElementById('reserve-space').options[document.getElementById('reserve-space').selectedIndex].text,
        date: document.getElementById('reserve-date').value,
        startTime: document.getElementById('reserve-start').value,
        endTime: document.getElementById('reserve-end').value,
        eventType: document.getElementById('reserve-type').value,
        name: document.getElementById('reserve-name').value,
        phone: document.getElementById('reserve-phone').value,
        email: document.getElementById('reserve-email').value,
        // CAMBIO 2: Validar si hay código de socio ingresado
        isMember: document.getElementById('member-code') ? 
                  document.getElementById('member-code').value.trim().length > 0 : 
                  false,
        guests: parseInt(document.getElementById('reserve-guests').value) || 0,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Obtener servicios adicionales (con cantidades calculadas automáticamente)
    const services = {};
    const guests = reservationData.guests;
    
    // Calcular cantidades basadas en invitados
    const chairsNeeded = guests;
    const tablesNeeded = Math.ceil(guests / 4);
    
    // Sillas
    const chairsSelect = document.getElementById('reserve-chairs');
    if (chairsSelect && chairsSelect.value !== 'none') {
        services['chairs'] = {
            service: chairsSelect.options[chairsSelect.selectedIndex].text,
            quantity: chairsNeeded,
            price: parseFloat(chairsSelect.options[chairsSelect.selectedIndex].dataset.price)
        };
    }
    
    // Mesas
    const tablesSelect = document.getElementById('reserve-tables');
    if (tablesSelect && tablesSelect.value !== 'none') {
        services['tables'] = {
            service: tablesSelect.options[tablesSelect.selectedIndex].text,
            quantity: tablesNeeded,
            price: parseFloat(tablesSelect.options[tablesSelect.selectedIndex].dataset.price)
        };
    }
    
    // Mantelería
    const linensSelect = document.getElementById('reserve-linens');
    if (linensSelect && linensSelect.value !== 'none') {
        let quantity = 0;
        if (linensSelect.value === "forros") {
            quantity = chairsNeeded; // Forros para sillas: 1 por silla
        } else {
            quantity = tablesNeeded; // Mantelería: 1 por mesa
        }
        
        services['linens'] = {
            service: linensSelect.options[linensSelect.selectedIndex].text,
            quantity: quantity,
            price: parseFloat(linensSelect.options[linensSelect.selectedIndex].dataset.price)
        };
    }
    
    // Meseros
    const waitersSelect = document.getElementById('reserve-waiters');
    if (waitersSelect && waitersSelect.value !== 'none') {
        const waitersNeeded = Math.max(1, Math.ceil(guests / 25));
        services['waiters'] = {
            service: waitersSelect.options[waitersSelect.selectedIndex].text,
            quantity: waitersNeeded,
            price: parseFloat(waitersSelect.options[waitersSelect.selectedIndex].dataset.price)
        };
    }
    
    reservationData.services = services;
    
    // Guardar reserva
    const reservations = getData('reservations') || [];
    reservations.push(reservationData);
    
    if (setData('reservations', reservations)) {
        showPublicMessage('¡Solicitud de reserva enviada correctamente! Te contactaremos pronto para confirmar.', 'success');
        resetReservationForm();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        showPublicMessage('Error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
    }
}

function validateReservationForm() {
    const requiredFields = [
        'reserve-space',
        'reserve-date',
        'reserve-start',
        'reserve-end',
        'reserve-name',
        'reserve-phone',
        'reserve-email',
        'reserve-guests'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            return false;
        } else {
            field.style.borderColor = '';
        }
    }
    
    // Validar que NO sea lunes
    const dateInput = document.getElementById('reserve-date');
    if (dateInput && dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 1) {
            showPublicMessage('Los lunes no están disponibles para reservas', 'error');
            return false;
        }
    }
    
    // Validar fechas y horas
    const date = document.getElementById('reserve-date').value;
    const startTime = document.getElementById('reserve-start').value;
    const endTime = document.getElementById('reserve-end').value;
    
    if (new Date(date + 'T' + startTime) >= new Date(date + 'T' + endTime)) {
        showPublicMessage('La hora de fin debe ser posterior a la hora de inicio', 'error');
        return false;
    }
    
    return true;
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function resetReservationForm() {
    const form = document.getElementById('reservation-form');
    if (form) {
        form.reset();
        
        // Ocultar todas las secciones de cantidad (que ya no deberían mostrarse)
        const quantityContainers = document.querySelectorAll('.quantity-selector');
        quantityContainers.forEach(container => {
            container.style.display = 'none';
        });
        
        // Ocultar sección de sugerencias y resumen
        const suggestedSection = document.getElementById('suggested-quantities');
        const servicesSummary = document.getElementById('services-summary');
        
        if (suggestedSection) suggestedSection.style.display = 'none';
        if (servicesSummary) servicesSummary.style.display = 'none';
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
    if (totalSpacesCount && !totalSpacesCount.textContent) {
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Colores según el tipo de mensaje
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
        messageDiv.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 10px;"></i> ${message}`;
    } else if (type === 'error') {
        messageDiv.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        messageDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i> ${message}`;
    } else if (type === 'info') {
        messageDiv.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        messageDiv.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 10px;"></i> ${message}`;
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    }, 5000);
}

function setupServiceSelects() {
    // Ocultar todos los contadores de cantidad
    const quantityContainers = document.querySelectorAll('.quantity-selector');
    quantityContainers.forEach(container => {
        container.style.display = 'none';
    });
    
    // Configurar los selects de servicios con la primera opción seleccionada
    const serviceSelects = [
        'quote-chairs', 'quote-tables', 'quote-linens', 'quote-waiters',
        'reserve-chairs', 'reserve-tables', 'reserve-linens', 'reserve-waiters'
    ];
    
    serviceSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.selectedIndex = 0;
        }
    });
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
window.calculateQuote = calculateQuote;
window.validateDateSelection = validateDateSelection;

// ========== CAMBIO 4: SISTEMA DE CÓDIGO DE SOCIO SIMPLIFICADO ==========
const validMemberCodes = ['CLUB-META-2025', 'SOCIO-VIP-2024', 'EL-META-001'];

function validateMemberCode(inputId, feedbackId) {
    const codeInput = document.getElementById(inputId);
    const feedbackElement = document.getElementById(feedbackId);
    
    if (!codeInput || !feedbackElement) return false;
    
    const enteredCode = codeInput.value.trim().toUpperCase();
    const isValid = validMemberCodes.includes(enteredCode);
    
    if (enteredCode === '') {
        codeInput.classList.remove('valid', 'invalid');
        feedbackElement.textContent = 'Ingresa tu código para 10% de descuento';
        feedbackElement.className = 'helper-text';
        return false;
    }
    
    if (isValid) {
        codeInput.classList.remove('invalid');
        codeInput.classList.add('valid');
        feedbackElement.textContent = '✅ Código válido - 10% descuento aplicado';
        feedbackElement.className = 'helper-text valid';
        showPublicMessage('¡Código de socio validado!', 'success');
    } else {
        codeInput.classList.remove('valid');
        codeInput.classList.add('invalid');
        feedbackElement.textContent = '❌ Código inválido';
        feedbackElement.className = 'helper-text invalid';
        showPublicMessage('Código incorrecto. Intenta nuevamente.', 'error');
    }
    
    // Recalcular cotización si existe
    if (typeof calculateQuote === 'function') {
        setTimeout(calculateQuote, 100);
    }
    
    return isValid;
}

// Hacer disponible globalmente
window.validateMemberCode = validateMemberCode;

// Añadir estilos CSS para las animaciones y mensajes
const style = document.createElement('style');
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .service-item {
        font-size: 0.9em;
        color: #666;
    }
    
    .service-item span:first-child {
        padding-left: 1rem;
    }
    
    /* Ocultar inputs de cantidad */
    .quantity-selector {
        display: none !important;
    }
    
    /* Estilo para inputs de fecha cuando muestran placeholder */
    input[type="date"] {
        position: relative;
    }
    
    input[type="date"]:invalid:not(:focus):not(:placeholder-shown)::before {
        content: attr(placeholder);
        color: #999;
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
    }
    
    /* Nota informativa sobre disponibilidad */
    .date-note {
        font-size: 0.85em;
        color: #e74c3c;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
    }
    
    .date-note i {
        font-size: 1em;
    }
    
    /* Calendario visual personalizado */
    .calendar-hint {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1rem;
        display: none;
    }
    
    .calendar-hint.show {
        display: block;
        animation: fadeIn 0.3s ease;
    }
    
    .calendar-hint h4 {
        margin-top: 0;
        color: #2c3e50;
        font-size: 1rem;
    }
    
    .calendar-hint ul {
        margin: 0.5rem 0 0 0;
        padding-left: 1.5rem;
        color: #7f8c8d;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Indicador visual para días bloqueados */
    .blocked-day {
        color: #e74c3c !important;
        text-decoration: line-through;
    }
`;
document.head.appendChild(style);

// Agregar notas informativas debajo de los inputs de fecha
function addDateNotes() {
    const dateInputs = ['quote-date', 'reserve-date'];
    
    dateInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input && !input.nextElementSibling?.classList.contains('date-note')) {
            const note = document.createElement('div');
            note.className = 'date-note';
            note.innerHTML = '<i class="fas fa-ban"></i> Los lunes no están disponibles';
            input.parentNode.insertBefore(note, input.nextSibling);
            
            // Agregar calendario visual
            const calendarHint = document.createElement('div');
            calendarHint.className = 'calendar-hint';
            calendarHint.id = `${inputId}-hint`;
            calendarHint.innerHTML = `
                <h4>📅 Horarios de disponibilidad:</h4>
                <ul>
                    <li><strong>✅ DISPONIBLE:</strong> Martes a Domingo</li>
                    <li class="blocked-day"><strong>❌ NO DISPONIBLE:</strong> Todos los lunes</li>
                    <li>Puedes seleccionar cualquier fecha excepto los lunes</li>
                    <li>Si seleccionas un lunes, el sistema te sugerirá el martes más cercano</li>
                </ul>
            `;
            input.parentNode.insertBefore(calendarHint, note.nextSibling);
            
            // Mostrar/ocultar hint al hacer focus
            input.addEventListener('focus', function() {
                calendarHint.classList.add('show');
            });
            
            input.addEventListener('blur', function() {
                setTimeout(() => {
                    if (!input.matches(':focus')) {
                        calendarHint.classList.remove('show');
                    }
                }, 200);
            });
        }
    });
}

// Ejecutar después de que la página cargue
setTimeout(addDateNotes, 100);