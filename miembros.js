document.addEventListener('DOMContentLoaded', () => {

    const memberForm = document.getElementById('member-form');
    const membersList = document.getElementById('members-list');
    const totalMembers = document.getElementById('total-members');

    let members = getData('members') || [];
    let editId = null;

    // Generar código de descuento aleatorio único
    function generateDiscountCode() {
        const code = "CLUB-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        return code;
    }

    // Guardar Socio
    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('member-name').value;
        const email = document.getElementById('member-email').value;
        const phone = document.getElementById('member-phone').value;

        const data = {
            id: editId ?? Date.now(),
            name,
            email,
            phone,
            discountCode: editId ? members.find(m => m.id === editId).discountCode : generateDiscountCode()
        };

        if (editId) {
            members = members.map(m => m.id === editId ? data : m);
            editId = null;
        } else {
            members.push(data);
        }

        setData('members', members);
        memberForm.reset();
        renderMembers();
    });

    function renderMembers() {
        membersList.innerHTML = "";
        totalMembers.textContent = members.length;

        members.forEach(m => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${m.name}</td>
                <td>${m.email}</td>
                <td>${m.phone}</td>
                <td><strong>${m.discountCode}</strong></td>
                <td>
                    <button class="btn-edit" onclick="editMember(${m.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-delete" onclick="deleteMember(${m.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;

            membersList.appendChild(tr);
        });
    }

    // Editar socio
    window.editMember = (id) => {
        const m = members.find(x => x.id === id);
        if (!m) return;

        document.getElementById('member-name').value = m.name;
        document.getElementById('member-email').value = m.email;
        document.getElementById('member-phone').value = m.phone;

        editId = id;
    };

    // Eliminar socio
    window.deleteMember = (id) => {
        members = members.filter(m => m.id !== id);
        setData('members', members);
        renderMembers();
    };

    renderMembers();
});
