const apiBase = `http://${window.location.hostname}:3000`;
let searchTerm = '';

async function loadProducts({ category = '', level = '' } = {}) {
    let url = `${apiBase}/api/products`;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (level) params.append('level', level);
    if (searchTerm) params.append('search', searchTerm);

    if ([...params].length > 0) {
        url += `?${params.toString()}`;
    }

    try {
        const res = await fetch(url);
        const products = await res.json();

        const container = document.getElementById('product-list');
        container.innerHTML = '';

        if (products.length === 0) {
            container.textContent = 'No products found.';
            return;
        }

        products.forEach(p => {
            const div = document.createElement('div');
            div.classList.add('product');
            div.innerHTML = `
                <h3>${p.name}</h3>
                <img src="/img/${p.image}" alt="${p.name}" width="150">
                <p>${p.description}</p>
                <p><strong>${p.price.toFixed(2)} €</strong></p>
                <p>⭐️ Bewertung: ${p.rating}/5</p>
                <button onclick="addToCart(${p.id})" class="btn btn-primary">Add to cart</button>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error("Error loading the products:", err);
    }
}

async function addToCart(productId) {
    console.log("Add product to cart:", productId);
    try {
        const res = await fetch(`${apiBase}/api/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId })
        });
        if (res.status === 401) {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        const result = await res.json();
        if (result.success) {
            console.log("Added successfully:", productId);
            showCartAlert("Product has been added to the cart!");
            updateCartCount();
        }
    } catch (err) {
        console.error("Error adding to cart:", err);
    }
}

function handleSearch() {
    searchTerm = document.getElementById('search-input').value;
    loadProducts();
}

function showCartAlert(message) {
    const container = document.getElementById('cart-alert-container');
    container.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${message}
        </div>
    `;

    setTimeout(() => {
        const alertElement = container.querySelector('.alert');
        if (alertElement) {
            const alert = bootstrap.Alert.getOrCreateInstance(alertElement);
            alert.close();
        }
    }, 1800);
}

window.addEventListener('DOMContentLoaded', () => {
    const category = getCategory();
    const level = getLevel();

    loadProducts({ category, level });
});

function getCategory() {
    const param = new URLSearchParams(window.location.search);
    return param.get('category') || '';
}

function getLevel() {
    const param = new URLSearchParams(window.location.search);
    return param.get('level') || '';
}