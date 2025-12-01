// miembros.js - Gestión de socios y prospectos
document.addEventListener('DOMContentLoaded', () => {
  if (typeof protectPage === 'function') protectPage();

  // Show user
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

  // Forms & tables
  const memberForm = document.getElementById('member-form');
  const prospectForm = document.getElementById('prospect-form');
  const membersTbody = document.querySelector('#members-table tbody');
  const prospectsTbody = document.querySelector('#prospects-table tbody');
  const countMembersEl = document.getElementById('count-members');
  const countProspectsEl = document.getElementById('count-prospects');

  // Safe get/set (use main.js if exists)
  const getDataSafe = (k) => {
    if (typeof getData === 'function') return getData(k) || [];
    try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; }
  };
  const setDataSafe = (k, v) => {
    if (typeof setData === 'function') return setData(k, v);
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
  };

  let members = getDataSafe('members') || [];
  let prospects = getDataSafe('prospects') || [];

  function renderCounts() {
    if (countMembersEl) countMembersEl.textContent = members.length;
    if (countProspectsEl) countProspectsEl.textContent = prospects.length;
  }

  function renderTables() {
    members = getDataSafe('members') || [];
    prospects = getDataSafe('prospects') || [];

    if (membersTbody) {
      membersTbody.innerHTML = members.map((m, i) => `
        <tr data-id="${m.id}">
          <td>${m.name}</td>
          <td>${m.email}</td>
          <td>${m.phone}</td>
          <td>
            <button class="btn-edit-member" data-id="${m.id}"><i class="fas fa-edit"></i> Editar</button>
            <button class="btn-delete-member" data-id="${m.id}"><i class="fas fa-trash"></i> Eliminar</button>
          </td>
        </tr>
      `).join('');
    }

    if (prospectsTbody) {
      prospectsTbody.innerHTML = prospects.map((p, i) => `
        <tr data-id="${p.id}">
          <td>${p.name}</td>
          <td>${p.email}</td>
          <td>${p.phone}</td>
          <td>
            <button class="btn-approve-prospect" data-id="${p.id}"><i class="fas fa-check"></i> Aprobar</button>
            <button class="btn-delete-prospect" data-id="${p.id}"><i class="fas fa-trash"></i> Eliminar</button>
          </td>
        </tr>
      `).join('');
    }
    renderCounts();
  }

  // Add member
  if (memberForm) {
    memberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('member-name').value.trim();
      const email = document.getElementById('member-email').value.trim();
      const phone = document.getElementById('member-phone').value.trim();

      if (!name || !email) return alert('Nombre y correo son requeridos');

      members.push({ id: Date.now(), name, email, phone, createdAt: new Date().toISOString() });
      setDataSafe('members', members);
      memberForm.reset();
      renderTables();
      showMessage('Socio registrado', 'success');
    });
  }

  // Add prospect
  if (prospectForm) {
    prospectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('prospect-name').value.trim();
      const email = document.getElementById('prospect-email').value.trim();
      const phone = document.getElementById('prospect-phone').value.trim();

      if (!name || !email) return alert('Nombre y correo son requeridos');

      prospects.push({ id: Date.now(), name, email, phone, createdAt: new Date().toISOString() });
      setDataSafe('prospects', prospects);
      prospectForm.reset();
      renderTables();
      showMessage('Prospecto agregado', 'success');
    });
  }

  // Approve prospect -> move to members
  document.addEventListener('click', (e) => {
    const approveBtn = e.target.closest('.btn-approve-prospect');
    const delMemberBtn = e.target.closest('.btn-delete-member');
    const delProspectBtn = e.target.closest('.btn-delete-prospect');
    const editMemberBtn = e.target.closest('.btn-edit-member');

    if (approveBtn) {
      const id = approveBtn.dataset.id;
      const idx = prospects.findIndex(p => String(p.id) === String(id));
      if (idx === -1) return;
      const approved = prospects.splice(idx,1)[0];
      members.push(approved);
      setDataSafe('prospects', prospects);
      setDataSafe('members', members);
      renderTables();
      showMessage('Prospecto aprobado y convertido en socio', 'success');
    } else if (delMemberBtn) {
      const id = delMemberBtn.dataset.id;
      if (!confirm('Eliminar socio?')) return;
      members = members.filter(m => String(m.id) !== String(id));
      setDataSafe('members', members);
      renderTables();
      showMessage('Socio eliminado', 'success');
    } else if (delProspectBtn) {
      const id = delProspectBtn.dataset.id;
      if (!confirm('Eliminar prospecto?')) return;
      prospects = prospects.filter(p => String(p.id) !== String(id));
      setDataSafe('prospects', prospects);
      renderTables();
      showMessage('Prospecto eliminado', 'success');
    } else if (editMemberBtn) {
      const id = editMemberBtn.dataset.id;
      const member = members.find(m => String(m.id) === String(id));
      if (!member) return;
      // Simple inline edit prompt (we keep simple UX)
      const newName = prompt('Editar nombre', member.name);
      const newEmail = prompt('Editar correo', member.email);
      const newPhone = prompt('Editar teléfono', member.phone);
      if (newName !== null) member.name = newName.trim() || member.name;
      if (newEmail !== null) member.email = newEmail.trim() || member.email;
      if (newPhone !== null) member.phone = newPhone.trim() || member.phone;
      setDataSafe('members', members);
      renderTables();
      showMessage('Socio actualizado', 'success');
    }
  });

  // Small message util
  function showMessage(msg, type='success') {
    const existing = document.querySelector('.message');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'message ' + (type === 'error' ? 'error' : 'success');
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(()=> div.remove(), 3000);
  }

  // Initial render
  renderTables();
});
