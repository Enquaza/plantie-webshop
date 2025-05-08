const apiBase = `http://${window.location.hostname}:3000`;

async function loadCart() {
    try {
        const res = await fetch(`${apiBase}/api/cart`, {
            credentials: 'include'
        });
        const cart = await res.json();
        renderCart(cart);
    } catch (err) {
        console.error("Error loading the cart:", err);
    }
}

function renderCart(cartItems) {
    const container = document.getElementById('cart-content');
    container.innerHTML = '';

    if (!cartItems || cartItems.length === 0) {
        container.innerHTML = '<p>Your cart is empty.❌</p>';
        document.getElementById('total-price').textContent = '0,00 €';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table');

    const thead = `
        <thead>
            <tr>
                <th scope="col">Product</th>
                <th scope="col">Price</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total</th>
                <th scope="col">Action</th>
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
            <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.productId})">Remove</button></td>
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
            console.log("Product removed:", productId);
            loadCart();
        }
    } catch (err) {
        console.error("Error when removing from the cart:", err);
    }
}

async function checkout() {
    const paymentMethod = document.getElementById('payment-method').value;

    if (!paymentMethod) {
        alert("Please select a payment method.");
        return;
    }

    try {
        const res = await fetch(`${apiBase}/api/cart/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ paymentMethod })
        });
        const result = await res.json();
        if (result.success) {
            alert("Order completed successfully!");
            loadCart();  // Warenkorb neu laden (jetzt leer)
        } else {
            alert("Order failed: " + (result.message || "Unknown error."));
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("An error has occurred. Please try again.");
    }
}

// Lade den Warenkorb beim Öffnen der Seite
window.addEventListener('DOMContentLoaded', loadCart);