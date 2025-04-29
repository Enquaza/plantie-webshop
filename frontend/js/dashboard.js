// Nach dem Laden der Seite Userdaten laden
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/auth/check`, {
            credentials: 'include'
        });

        const status = await res.json();

        if (status.loggedIn) {
            document.getElementById('username').textContent = status.user.username;
            document.getElementById('email').textContent = status.user.email;
        } else {
            alert('Bitte zuerst einloggen.');
            window.location.href = '/sites/login.html';
        }
    } catch (err) {
        console.error('Fehler beim Abrufen der Userdaten:', err);
        alert('Serverfehler. Bitte später versuchen.');
    }
});
