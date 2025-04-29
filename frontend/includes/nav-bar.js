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

            // ➡️ Admin-Link nur falls Admin
            if (status.user.isAdmin) {
                dropdownMenu += `
            <li><a class="dropdown-item" href="/sites/admin-products.html">Produkte verwalten 🛠️</a></li>
        `;
            }

            // ➡️ Logout-Link immer anhängen
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
            }, 200); // kleine Verzögerung zum Wechsel ins Menü
        });
    });
}

// 🚀 Direkt beim Seitenstart Navbar laden
loadNavbar();
