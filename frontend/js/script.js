// Verbindungstest mit Backend
fetch(`http://${window.location.hostname}:3000/api/test`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('backend-msg').textContent = data.message;
    })
    .catch(err => {
        console.error('Fehler beim Laden:', err);
    });

fetch('includes/nav-bar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

function loadContent(page) {
    let file = '';

    switch (page) {
        case 'home':
            file = 'sites/home.html';
            break;
        case 'products':
            file = 'sites/products.html';
            break;
        case 'register':
            file = 'sites/register.html';
            break;
        case 'login':
            file = 'sites/login.html';
            break;
        default:
            file = 'sites/home.html';
    }

    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
        })
}

window.onload = () => {
    loadContent('home');
};