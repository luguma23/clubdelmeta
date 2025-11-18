document.addEventListener('DOMContentLoaded', () => {
    const memberForm = document.getElementById('member-form');
    const prospectForm = document.getElementById('prospect-form');
    const membersList = document.getElementById('members-list');
    const prospectsList = document.getElementById('prospects-list');
    let members = getData('members');
    let prospects = getData('prospects');

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('member-name').value;
        const email = document.getElementById('member-email').value;
        const phone = document.getElementById('member-phone').value;
        members.push({ id: Date.now(), name, email, phone });
        setData('members', members);
        renderLists();
        memberForm.reset();
    });

    prospectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.get