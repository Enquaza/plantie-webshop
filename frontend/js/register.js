const form = document.getElementById('registerForm');
const msg = document.getElementById('msg');

// Nutzer drückt auf Registrieren -> Funktion wird gefeuert
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("Submitted!");

    const data = {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        passwordRepeat: form.passwordRepeat.value
    };

    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            msg.textContent = "🎉 Registrierung erfolgreich!";
            msg.style.color = "green";
            form.reset();

        } else {
            msg.textContent = "❌ " + (result.error || "Unbekannter Fehler");
            msg.style.color = "red";
        }
    } catch (err) {
        msg.textContent = "❌ Server nicht erreichbar.";
        msg.style.color = "red";
    }
});
