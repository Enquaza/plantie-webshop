const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const db = require('backend/config/db');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            msg.textContent = `🎉 Login erfolgreich: Willkommen ${data.user.username}`;
            msg.style.color = 'green';
        } else {
            msg.textContent = `❌ Fehler: ${data.error || 'Unbekannter Fehler'}`;
            msg.style.color = 'red';
        }
    } catch (err) {
        msg.textContent = '❌ Server nicht erreichbar.';
        msg.style.color = 'red';
    }
});
