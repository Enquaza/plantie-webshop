const apiBase = `http://${window.location.hostname}:3000`;

async function loadCart() {
    try {
        const res = await fetch(`${apiBase}/api/cart`, {
            credentials: 'include'
        });
        const cart = await res.json();
        renderCart(cart);
    } catch (err) {
        console.error("Fehler beim Laden des Warenkorbs:", err);
    }
}

function renderCart(cartItems) {
    const container = document.getElementById('cart-content');
    container.innerHTML = '';

    if (!cartItems || cartItems.length === 0) {
        container.innerHTML = '<p>Dein Warenkorb ist leer.</p>';
        document.getElementById('total-price').textContent = '0,00 €';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table');

    const thead = `
        <thead>
            <tr>
                <th>Produkt</th>
                <th>Preis</th>
                <th>Menge</th>
                <th>Summe</th>
                <th>Aktion</th>
            </tr>
        </thead>
    `;
    table.innerHTML = thead;

    const tbody = document.createElement('tbody');
    let total = 0;

    cartItems.forEach(item => {
        const sum = item.price * item.quantity;
        total += sum;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.price.toFixed(2)} €</td>
            <td>${item.quantity}</td>
            <td>${sum.toFixed(2)} €</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.productId})">Entfernen</button></td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    document.getElementById('total-price').textContent = total.toFixed(2) + ' €';
}

async function removeFromCart(productId) {
    try {
        const res = await fetch(`${apiBase}/api/cart/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId })
        });
        const result = await res.json();
        if (result.success) {
            console.log("Produkt entfernt:", productId);
            loadCart();
        }
    } catch (err) {
        console.error("Fehler beim Entfernen aus dem Warenkorb:", err);
    }
}

async function checkout() {
    try {
        const res = await fetch(`${apiBase}/api/cart/checkout`, {
            method: 'POST',
            credentials: 'include'
        });
        const result = await res.json();
        if (result.success) {
            alert("Bestellung erfolgreich abgeschlossen!");
            loadCart();  // Warenkorb neu laden (jetzt leer)
        } else {
            alert("Bestellung fehlgeschlagen: " + (result.message || "Unbekannter Fehler"));
        }
    } catch (err) {
        console.error("Fehler beim Checkout:", err);
        alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
}

// Lade den Warenkorb beim Öffnen der Seite
window.addEventListener('DOMContentLoaded', loadCart);
