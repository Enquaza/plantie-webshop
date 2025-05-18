const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = form.identifier.value;
    const password = form.password.value;
    const remember = form.remember.checked;

    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ identifier, password, remember })
        });

        const data = await res.json();

        if (res.ok) {
            msg.textContent = `🎉 Login successful: Welcome ${data.user.username}`;
            msg.style.color = 'purple';
            form.reset();

            // Navbar-Loginstatus aktualisieren
            if (typeof updateLoginStatus === 'function') {
                updateLoginStatus();
            }

            setTimeout(() => {
                window.location.href = '/index.html'; // Optional: Weiterleitung nach kurzer Zeit
            }, 1000);

        } else {
            msg.textContent = `❌ Error: ${data.error || 'Unknown error.'}`;
            msg.style.color = 'red';
        }
    } catch (err) {
        msg.textContent = '❌ Server not accessible.';
        msg.style.color = 'red';
        console.error('Login error:', err);
    }
});