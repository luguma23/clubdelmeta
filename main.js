// Cargar datos iniciales desde JSON si no existen en localStorage
if (!localStorage.getItem('spaces')) localStorage.setItem('spaces', JSON.stringify([]));
if (!localStorage.getItem('reservations')) localStorage.setItem('reservations', JSON.stringify([]));
if (!localStorage.getItem('members')) localStorage.setItem('members', JSON.stringify([]));
if (!localStorage.getItem('prospects')) localStorage.setItem('prospects', JSON.stringify([]));

// Funciones auxiliares
function getData(key) { return JSON.parse(localStorage.getItem(key)) || []; }
function setData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function loadSpaces() {
    const spaces = getData('spaces');
    const select = document.getElementById('space-select');
    if (select) {
        select.innerHTML = '';
        spaces.forEach(space => {
            const option = document.createElement('option');
            option.value = space.id;
            option.textContent = space.name;
            select.appendChild(option);
        });
    }
}
document.addEventListener('DOMContentLoaded', loadSpaces);