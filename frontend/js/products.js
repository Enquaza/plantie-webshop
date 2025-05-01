const apiBase = `http://${window.location.hostname}:3000`;

async function loadProducts(category = '') {
    const url = category
        ? `http://${window.location.hostname}:3000/api/products?category=${encodeURIComponent(category)}`
        : `http://${window.location.hostname}:3000/api/products`;

    try {
        const res = await fetch(url);
        const products = await res.json();

        const container = document.getElementById('product-list');
        container.innerHTML = '';

        if (products.length === 0) {
            container.textContent = 'Keine Produkte gefunden.';
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
                <button onclick="addToCart(${p.id})">In den Warenkorb</button>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error("Fehler beim Laden der Produkte:", err);
    }
}

async function addToCart(productId) {
    console.log("Produkt in den Warenkorb:", productId);
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
            console.log("Erfolgreich hinzugeügt:", productId);
        }
    } catch (err) {
        console.error("Fehler beim Hinzufügen zum Warenkorb:", err);
    }
}

// direkt beim Laden alle Produkte anzeigen
window.addEventListener('DOMContentLoaded', () => loadProducts());
