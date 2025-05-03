window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/auth/check`, {
            credentials: 'include'
        });

        const status = await res.json();

        if (status.loggedIn) {
            document.getElementById('username').textContent = status.user.username;
            document.getElementById('email').textContent = status.user.email;
            document.getElementById('paymentInfo').textContent = status.user.paymentInfo || "No payment information yet.";
        } else {
            alert('Please login first.');
            window.location.href = '/sites/login.html';
        }
    } catch (err) {
        console.error('❌ Error retrieving user data:', err);
        alert('Server error. Please try later.');
    }
});

// ✏️ Formular-Submit für Stammdaten-Update behandeln
const updateForm = document.getElementById('update-form');
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const address = updateForm.address.value;
    const paymentInfoNew = updateForm.paymentInfoNew.value;
    const passwordConfirm = updateForm.passwordConfirm.value;

    if (!passwordConfirm) {
        alert('Please enter your password to confirm.');
        return;
    }

    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/auth/update`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, paymentInfoNew, passwordConfirm })
        });

        const result = await res.json();

        if (res.ok) {
            alert('✅ Daten erfolgreich aktualisiert!');
            if (paymentInfoNew) {
                document.getElementById('paymentInfo').textContent = paymentInfoNew;
            }
            updateForm.reset();
        } else {
            alert('❌ ' + (result.error || 'Error when saving.'));
        }
    } catch (err) {
        console.error('❌ Error during transmission:', err);
        alert('Server error. Please try later.');
    }
});

// 🔴 Logout-Button Handling (optional falls vorhanden)
function logout() {
    fetch(`http://${window.location.hostname}:3000/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(() => {
            window.location.href = '/index.html';
        })
        .catch((err) => {
            console.error('Logout-error:', err);
        });
}

async function loadOrders() {
    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/orders`, {
            credentials: 'include'
        });
        const orders = await res.json();

        const table = document.getElementById('orders-table').querySelector('tbody');
        table.innerHTML = '';

        if (!orders.length) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4">No orders found.</td>`;
            table.appendChild(row);
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${order.id}</th>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>${order.payment_method}</td>
                <td><button class="btn btn-primary btn-sm" onclick="viewInvoice(${order.id})">Show invoice</button></td>
            `;
            table.appendChild(row);
        });
    } catch (err) {
        console.error("Error loading orders:", err);
    }
}

// Bestellungen laden, sobald Seite bereit
window.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

function viewInvoice(orderId) {
    window.open(`/api/orders/invoice/${orderId}`, '_blank');
}