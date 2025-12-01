// reservas.js - Administración de reservas (tabla, filtros, acciones)
document.addEventListener('DOMContentLoaded', () => {
  // Proteger la página: requiere auth.js con protectPage()
  if (typeof protectPage === 'function') protectPage();

  // Mostrar usuario y logout
  if (typeof getCurrentUser === 'function' && getCurrentUser()) {
    const u = getCurrentUser();
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) userDisplay.textContent = u.fullName || u.username;
  }
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && typeof auth !== 'undefined') {
    logoutBtn.addEventListener('click', () => {
      if (auth && auth.handleLogout) auth.handleLogout();
      else { localStorage.removeItem('currentUser'); window.location.href = 'administrador.html'; }
    });
  }

  // Elementos
  const tableBody = document.querySelector('#reservations-table tbody');
  const noReservations = document.getElementById('no-reservations');
  const searchInput = document.getElementById('reservations-search');
  const statusFilter = document.getElementById('reservations-filter-status');
  const spaceFilter = document.getElementById('reservations-filter-space');

  // Helpers: usa getData/setData de main.js si existen, sino define
  const getDataSafe = (k) => {
    if (typeof getData === 'function') return getData(k) || [];
    try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; }
  };
  const setDataSafe = (k, v) => {
    if (typeof setData === 'function') return setData(k, v);
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
  };

  // Cargar y renderizar
  function loadFilters() {
    const spaces = getDataSafe('spaces') || [];
    if (!spaceFilter) return;
    spaceFilter.innerHTML = '<option value="">Filtrar por espacio</option>';
    spaces.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      spaceFilter.appendChild(opt);
    });
  }

  function renderTable() {
    const reservations = getDataSafe('reservations') || [];
    const spaces = getDataSafe('spaces') || [];

    if (!tableBody) return;

    // Apply filters and search
    const search = searchInput?.value?.toLowerCase() || '';
    const status = statusFilter?.value || '';
    const spaceId = spaceFilter?.value || '';

    const filtered = reservations.filter(r => {
      if (status && r.status !== status) return false;
      if (spaceId && String(r.spaceId) !== String(spaceId)) return false;
      if (!search) return true;
      const space = spaces.find(s => String(s.id) === String(r.spaceId));
      return (
        (r.name && r.name.toLowerCase().includes(search)) ||
        (r.email && r.email.toLowerCase().includes(search)) ||
        (space && space.name.toLowerCase().includes(search)) ||
        (r.date && r.date.includes(search))
      );
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      if (noReservations) noReservations.style.display = 'block';
      return;
    } else {
      if (noReservations) noReservations.style.display = 'none';
    }

    tableBody.innerHTML = filtered.map((r, idx) => {
      const space = spaces.find(s => String(s.id) === String(r.spaceId)) || { name: 'N/A' };
      const guests = r.guests || r.guests === 0 ? r.guests : '-';
      const total = typeof r.total === 'number' ? `$${r.total.toFixed(2)}` : (r.total ? `$${r.total}` : '-');
      const statusLabel = `<span class="status-badge ${r.status}">${r.status.toUpperCase()}</span>`;

      // Use unique index per reservation: use id
      const idxId = r.id;

      return `
        <tr data-res-id="${idxId}">
          <td>${space.name}</td>
          <td>${r.date || '-'}</td>
          <td>${(r.startTime || r.start || '')}-${(r.endTime || r.end || '')}</td>
          <td>${r.name || r.clientName || '-'}</td>
          <td>${guests}</td>
          <td>${total}</td>
          <td>${statusLabel}</td>
          <td>
            ${r.status !== 'approved' ? `<button class="btn-approve" data-id="${idxId}"><i class="fas fa-check"></i> Aprobar</button>` : ''}
            ${r.status !== 'rejected' ? `<button class="btn-reject" data-id="${idxId}"><i class="fas fa-times"></i> Rechazar</button>` : ''}
            <button class="btn-delete" data-id="${idxId}"><i class="fas fa-trash"></i> Eliminar</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Actions (approve/reject/delete)
  function updateReservationStatus(id, status) {
    const reservations = getDataSafe('reservations') || [];
    const index = reservations.findIndex(r => String(r.id) === String(id));
    if (index === -1) return false;
    reservations[index].status = status;
    setDataSafe('reservations', reservations);
    renderTable();
    renderDashboardCounts();
    showMessage(`Reserva ${status}`, 'success');
    return true;
  }

  function deleteReservation(id) {
    if (!confirm('¿Eliminar esta reserva?')) return;
    const reservations = getDataSafe('reservations') || [];
    const updated = reservations.filter(r => String(r.id) !== String(id));
    setDataSafe('reservations', updated);
    renderTable();
    renderDashboardCounts();
    showMessage('Reserva eliminada', 'success');
  }

  // Small message util (public)
  function showMessage(msg, type='success') {
    const existing = document.querySelector('.message');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'message ' + (type === 'error' ? 'error' : 'success');
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(()=> div.remove(), 3000);
  }

  // Event delegation for action buttons
  document.addEventListener('click', (e) => {
    const approve = e.target.closest('.btn-approve');
    const reject = e.target.closest('.btn-reject');
    const del = e.target.closest('.btn-delete');

    if (approve) {
      const id = approve.dataset.id;
      updateReservationStatus(id, 'approved');
      // Optionally notify (email/sms) - not implemented
    } else if (reject) {
      const id = reject.dataset.id;
      updateReservationStatus(id, 'rejected');
    } else if (del) {
      const id = del.dataset.id;
      deleteReservation(id);
    }
  });

  // Render dashboard small counts for admin header if exist
  function renderDashboardCounts() {
    const reservations = getDataSafe('reservations') || [];
    // Update any element ids used elsewhere
    const pendingEl = document.getElementById('stats-pending');
    if (pendingEl) pendingEl.textContent = reservations.filter(r => r.status === 'pending').length;
    const totalEl = document.getElementById('total-reservations');
    if (totalEl) totalEl.textContent = reservations.length;
  }

  // Wire inputs
  [searchInput, statusFilter, spaceFilter].forEach(el => {
    if (!el) return;
    el.addEventListener('input', debounce(renderTable, 200));
    el.addEventListener('change', debounce(renderTable, 200));
  });

  // Debounce util
  function debounce(fn, wait = 150) {
    let t;
    return function(...args) {
      clearTimeout(t);
      t = setTimeout(()=> fn.apply(this, args), wait);
    };
  }

  // CSV export helper
  function exportReservationsCSV() {
    const reservations = getDataSafe('reservations') || [];
    if (reservations.length === 0) return showMessage('No hay reservas para exportar', 'error');
    const spaces = getDataSafe('spaces') || [];
    const rows = [['id','espacio','fecha','inicio','fin','cliente','email','telefono','invitados','total','estado']];
    reservations.forEach(r => {
      const s = (spaces.find(sp=>String(sp.id)===String(r.spaceId)) || {}).name || '';
      rows.push([r.id, s, r.date || '', r.startTime || r.start || '', r.endTime || r.end || '', r.name || '', r.email || '', r.phone || '', r.guests || '', r.total || '', r.status || '']);
    });
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Attach a keyboard shortcut: Ctrl+E export
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'e') {
      exportReservationsCSV();
    }
  });

  // Initial load
  loadFilters();
  renderTable();
  renderDashboardCounts();
});
