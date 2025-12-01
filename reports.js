// reports.js - Generador de reportes simples
document.addEventListener('DOMContentLoaded', () => {
  if (typeof protectPage === 'function') protectPage();

  // Mostrar usuario
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

  const out = document.getElementById('report-output');
  const genBtn = document.getElementById('generate-report');
  const csvBtn = document.getElementById('download-csv');

  const getDataSafe = (k) => {
    if (typeof getData === 'function') return getData(k) || [];
    try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; }
  };

  function generateReport() {
    const spaces = getDataSafe('spaces') || [];
    const reservations = getDataSafe('reservations') || [];
    const members = getDataSafe('members') || [];
    const prospects = getDataSafe('prospects') || [];

    // Totales
    const totalSpaces = spaces.length;
    const totalReservations = reservations.length;
    const approved = reservations.filter(r => r.status === 'approved').length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const rejected = reservations.filter(r => r.status === 'rejected').length;

    // Ingresos por reservas aprobadas (si tienen total)
    const ingresos = reservations.filter(r => r.status === 'approved').reduce((acc, r) => acc + (parseFloat(r.total) || 0), 0);

    // Espacios más usados
    const counts = {};
    reservations.forEach(r => {
      const id = String(r.spaceId);
      counts[id] = (counts[id]||0) + 1;
    });
    const ranked = Object.keys(counts).map(id => ({ id, count: counts[id], name: (spaces.find(s=>String(s.id)===id)||{}).name || id }))
      .sort((a,b) => b.count - a.count)
      .slice(0,5);

    // Últimas reservas (5)
    const recent = reservations.slice().sort((a,b)=> new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0,5);

    // Build HTML
    const html = `
      <div class="card">
        <h3>Resumen General</h3>
        <p>Total espacios: <strong>${totalSpaces}</strong></p>
        <p>Total reservas: <strong>${totalReservations}</strong> (Aprobadas: ${approved}, Pendientes: ${pending}, Rechazadas: ${rejected})</p>
        <p>Ingresos estimados (aprobadas): <strong>$${ingresos.toFixed(2)}</strong></p>
        <p>Socios registrados: <strong>${members.length}</strong></p>
        <p>Prospectos registrados: <strong>${prospects.length}</strong></p>
      </div>

      <div class="card" style="margin-top:1rem;">
        <h3>Espacios más reservados</h3>
        <ul>
          ${ranked.length ? ranked.map(r => `<li>${r.name}: ${r.count} reservas</li>`).join('') : '<li>No hay reservas todavía</li>'}
        </ul>
      </div>

      <div class="card" style="margin-top:1rem;">
        <h3>Últimas solicitudes</h3>
        <ul>
          ${recent.length ? recent.map(r => `<li>${(r.name||r.clientName||'Sin nombre')} — ${r.date || '-'} — ${r.status}</li>`).join('') : '<li>No hay actividad reciente</li>'}
        </ul>
      </div>
    `;
    if (out) out.innerHTML = html;
    return { spaces, reservations, members, prospects, reportDate: new Date().toISOString(), ingresos, ranked, recent };
  }

  let lastReport = null;
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      lastReport = generateReport();
    });
  } else {
    lastReport = generateReport();
  }

  if (csvBtn) {
    csvBtn.addEventListener('click', () => {
      if (!lastReport) lastReport = generateReport();
      const { reservations, spaces } = lastReport;
      if (!reservations || reservations.length === 0) return alert('No hay datos para exportar');
      const rows = [['id','espacio','fecha','inicio','fin','cliente','email','telefono','invitados','total','estado']];
      reservations.forEach(r => {
        const s = (spaces.find(sp => String(sp.id) === String(r.spaceId)) || {}).name || '';
        rows.push([r.id, s, r.date || '', r.startTime || r.start || '', r.endTime || r.end || '', r.name || '', r.email || '', r.phone || '', r.guests || '', r.total || '', r.status || '']);
      });
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_reservas_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }
});
