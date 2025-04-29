// Verbindungstest mit Backend
fetch(`http://${window.location.hostname}:3000/api/test`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('backend-msg').textContent = data.message;
    })
    .catch(err => {
        console.error('Fehler beim Laden:', err);
    });

