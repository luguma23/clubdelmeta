document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reserve-form');
    const quoteDisplay = document.getElementById('quote-display');
    const reservationsList = document.getElementById('reservations-list');
    let reservations = getData('reservations');
    const members = getData('members');

    // Tarifas simuladas (de tariffs.json)
    const tariffs = { 'Sala': 50, 'Auditorio': 100 }; // Por hora

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const spaceId = document.getElementById('space-select').value;
        const date = document.getElementById('date').value;
        const start = document.getElementById('start-time').value;
        const end = document.getElementById('end-time').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const isMember = document.getElementById('is-member').checked;

        const space = getData('spaces').find(s => s.id == spaceId);
        const hours = (new Date(`1970-01-01T${end}`) - new Date(`1970-01-01T${start}`)) / 3600000;
        const baseRate = tariffs[space.type] || 50;
        const discount = isMember ? 0.1 : 0; // 10% descuento para socios
        const total = baseRate * hours * (1 - discount);

        quoteDisplay.innerHTML = `<p>Cotización: $${total.toFixed(2)} (Descuento aplicado: ${discount * 100}%)</p>`;

        reservations.push({ id: Date.now(), spaceId, date, start, end, name, email, phone, isMember, status: 'pending', total });
        setData('reservations', reservations);
        alert('Reserva solicitada. Espera aprobación.');
        form.reset();
    });

    function renderReservations() {
        if (!reservationsList) return;
        reservationsList.innerHTML = '';
        reservations.forEach((res, index) => {
            const li = document.createElement('li');
            li.innerHTML = `${res.name} - ${res.date} ${res.start}-${res.end} - $${res.total} - ${res.status} <button onclick="approveReservation(${index})">Aprobar</button> <button onclick="rejectReservation(${index})">Rechazar</button>`;
            reservationsList.appendChild(li);
        });
    }

    window.approveReservation = (index) => {
        reservations[index].status = 'approved';
        setData('reservations', reservations);
        renderReservations();
        sendNotification(reservations[index], 'approved');
    };

    window.rejectReservation = (index) => {
        reservations[index].status = 'rejected';
        setData('reservations', reservations);
        renderReservations();
        sendNotification(reservations[index], 'rejected');
    };

    renderReservations();
});