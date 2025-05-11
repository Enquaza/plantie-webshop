/*function loadNavbar() {
    fetch('/includes/nav-bar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            updateLoginStatus();
            setupDropdownHover();
        });
}

async function updateLoginStatus() {
    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/auth/check`, {
            credentials: 'include'
        });

        const status = await res.json();

        if (status.loggedIn) {
            const navbar = document.querySelector('.navbar .d-flex');


            let dropdownMenu = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        👋 ${status.user.username}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="/sites/dashboard.html">Mein Konto</a></li>
            `;

            if (status.user.isAdmin) {
                dropdownMenu += `
                    <li><a class="dropdown-item" href="/sites/admin-products.html">Produkte verwalten 🛠️</a></li>
            `;
            }

            dropdownMenu += `
                        <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
                    </ul>
                </div>
      `;

            // ➡️ Jetzt erst HTML einsetzen
            navbar.innerHTML = dropdownMenu;

            setupDropdownHover(); // Hover neu setzen
        }
    } catch (err) {
        console.error('❌ Fehler beim Prüfen des Loginstatus:', err);
    }
}

function logout() {
    fetch(`http://${window.location.hostname}:3000/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(() => {
            window.location.href = '/index.html'; // Nach Logout zur Startseite
        });
}

function setupDropdownHover() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        let timer;

        dropdown.addEventListener('mouseenter', function () {
            clearTimeout(timer);
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const instance = bootstrap.Dropdown.getOrCreateInstance(toggle);
            instance.show();
        });

        dropdown.addEventListener('mouseleave', function () {
            timer = setTimeout(() => {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                const instance = bootstrap.Dropdown.getOrCreateInstance(toggle);
                instance.hide();
            }, 200);
        });
    });
}

// 🚀 Direkt beim Seitenstart Navbar laden
loadNavbar();*/

// ====================================================

function loadNavbar() {
    fetch('/includes/nav-bar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            updateLoginStatus();
            setupDropdownHover();
        });
}

async function updateLoginStatus() {
    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/auth/check`, {
            credentials: 'include'
        });

        const status = await res.json();
        const buttonArea = document.querySelector('.navbar .d-flex'); // Nur die rechte Seite ändern

        if (status.loggedIn) {
            if (status.user.isAdmin) {
                // Admin
                buttonArea.innerHTML = `
                    <a class="btn btn-outline-primary me-2" href="/sites/admin-products.html">Manage products</a>
                    <a class="btn btn-outline-primary me-2" href="/sites/admin-customers.html">Manage customers</a>
                    <button class="btn btn-outline-danger" onclick="logout()">Logout</button>
                `;
            } else {
                // Normale eingeloggte User
                buttonArea.innerHTML = `
                    <a class="btn btn-outline-primary me-2" href="/sites/dashboard.html">My account</a>
                    <a class="btn btn-outline-primary me-2" href="/sites/cart.html">Cart</a>
                    <button class="btn btn-outline-danger" onclick="logout()">Logout</button>
                `;
            }
        } else {
            // Nicht eingeloggt (Gast)
            buttonArea.innerHTML = `
                <a class="btn btn-outline-success me-2" href="/sites/register.html">Register</a>
                <a class="btn btn-outline-primary" href="/sites/login.html">Login</a>
            `;
        }
    } catch (err) {
        console.error('❌ Error checking the login status:', err);
    }
}

function logout() {
    console.log("Logout is being executed...");

    fetch(`http://${window.location.hostname}:3000/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(res => {
            console.log("Logout response status:", res.status);
            if (res.ok) {
                window.location.href = '/index.html';
            } else {
                console.error("Logout failed:", res.status);
                alert("Logout failed. Please try again.");
            }
        })
        .catch(err => {
            console.error("Error during logout fetch:", err);
        });
}


function setupDropdownHover() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        let timer;

        dropdown.addEventListener('mouseenter', function () {
            clearTimeout(timer);
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const instance = bootstrap.Dropdown.getOrCreateInstance(toggle);
            instance.show();
        });

        dropdown.addEventListener('mouseleave', function () {
            timer = setTimeout(() => {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                const instance = bootstrap.Dropdown.getOrCreateInstance(toggle);
                instance.hide();
            }, 200);
        });
    });
}

loadNavbar();


