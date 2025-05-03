const apiBase = `http://${window.location.hostname}:3000`;
let searchTerm = '';

async function loadProducts(category = '') {
    let url = `${apiBase}/api/products`;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
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
        }
    } catch (err) {
        console.error("Error adding to cart:", err);
    }
}

function handleSearch() {
    searchTerm = document.getElementById('search-input').value;
    loadProducts();
}

// direkt beim Laden alle Produkte anzeigen
// window.addEventListener('DOMContentLoaded', () => loadProducts());
// musste das bissi anpassen

window.addEventListener('DOMContentLoaded', () => {
    const category = getCategory();
    loadProducts(category);
});

function getCategory() {
    const param = new URLSearchParams(window.location.search);
    return param.get('category') || '';
}