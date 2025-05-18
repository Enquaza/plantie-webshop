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
                    <a class="btn btn-outline-primary me-2 position-relative" href="/sites/cart.html">
                        Cart 🛒
                        <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            0
                        </span>
                    </a>
                    <button class="btn btn-outline-danger" onclick="logout()">Logout</button>
                `;
                updateCartCount();
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


/* function setupDropdownHover() {
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
}*/

async function updateCartCount() {
    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/cart`, {
            credentials: 'include'
        });
        const cartItems = await res.json();

        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        const cartBadge = document.getElementById('cart-count');
        if (cartBadge) {
            cartBadge.textContent = count;
        }
    } catch (err) {
        console.error("❌ Error loading cart counter: ", err);
    }
}

loadNavbar();