fetch('http://localhost:3000/api/test')
    .then(res => res.json())
    .then(data => {
        document.getElementById('backend-msg').textContent = data.message;
    })
    .catch(err => {
        console.error('Fehler beim Laden:', err);
    });

// Beispiel Login per Fetch
fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'max@plantie.at',
        password: 'test123'
    })
})
    .then(res => res.json())
    .then(data => {
        console.log('Login erfolgreich:', data);
    })
    .catch(err => console.error('Fehler beim Login:', err));