const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;
    const remember = form.remember.checked

    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, remember })
        });

        const data = await res.json();

        if (res.ok) {
            msg.textContent = `🎉 Login erfolgreich: Willkommen ${data.user.username}`;
            msg.style.color = 'green';
            form.reset();
        } else {
            msg.textContent = `❌ Fehler: ${data.error || 'Unbekannter Fehler'}`;
            msg.style.color = 'red';
        }
    } catch (err) {
        msg.textContent = '❌ Server nicht erreichbar.';
        msg.style.color = 'red';
    }
});
