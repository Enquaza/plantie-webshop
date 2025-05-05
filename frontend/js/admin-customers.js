const apiBase = `http://${window.location.hostname}:3000`;

async function loadCustomers() {
    const res = await fetch(`${apiBase}/api/admin/customers`, {
        credentials: 'include'
    });
    const customers = await res.json();

    const table = document.getElementById('customer-table').querySelector('tbody');
    table.innerHTML = '';

    customers.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td scope="row">${c.id}</td>
            <td>${c.username}</td>
            <td>${c.email}</td>
            <td>${c.active ? 'Enabled' : 'Disabled'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="loadOrders(${c.id})">Orders</button>
                <button class="btn btn-sm btn-warning" onclick="toggleCustomer(${c.id}, ${c.active})">${c.active ? 'Disable' : 'Enable'}</button>
            </td>
        `;
        table.appendChild(row);
    });
}

async function toggleCustomer(customerId, isActive) {
    const res = await fetch(`${apiBase}/api/admin/customers/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerId, active: !isActive })
    });
    const result = await res.json();
    if (result.success) {
        loadCustomers();
    } else {
        alert("Action failed.");
    }
}

async function loadOrders(customerId) {
    const res = await fetch(`${apiBase}/api/admin/customers/${customerId}/orders`, {
        credentials: 'include'
    });
    const orders = await res.json();

    const table = document.getElementById('order-table').querySelector('tbody');
    table.innerHTML = '';

    orders.forEach(o => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">PL-${o.orderId.toString().padStart(5, '0')}</th> 
            <td>${o.productName}</td>
            <td>${o.quantity}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeProductFromOrder(${o.orderId}, ${o.productId})">Remove</button></td>
        `;
        table.appendChild(row);
    });
}

async function removeProductFromOrder(orderId, productId) {
    const res = await fetch(`${apiBase}/api/admin/customers/orders/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId, productId })
    });
    const result = await res.json();
    if (result.success) {
        // Einfach alle Kunden neu laden, damit wir aktualisierte Daten haben
        loadCustomers();
        document.getElementById('order-table').querySelector('tbody').innerHTML = '';
    } else {
        alert("Product could not be removed.");
    }
}

window.addEventListener('DOMContentLoaded', loadCustomers);