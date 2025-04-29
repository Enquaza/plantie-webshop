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

function addToCart(productId) {
    console.log("Produkt in den Warenkorb:", productId);
    // kommt später: AJAX zum Warenkorb
}

// direkt beim Laden alle Produkte anzeigen
window.addEventListener('DOMContentLoaded', () => loadProducts());
