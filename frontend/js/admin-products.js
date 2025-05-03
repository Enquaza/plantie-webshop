const form = document.getElementById('productForm');
const tableBody = document.querySelector('#productTable tbody');

async function fetchProducts() {
    const res = await fetch(`http://${window.location.hostname}:3000/api/products`);
    const products = await res.json();

    tableBody.innerHTML = '';

    products.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${p.id}</th>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.price.toFixed(2)} €</td>
            <td><img src="/img/${p.image}" width="50"></td>
            <td>
                <button onclick="deleteProduct(${p.id})" class="btn btn-danger">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const res = await fetch(`http://${window.location.hostname}:3000/api/products`, {
        method: 'POST',
        body: formData
    });

    const result = await res.json();
    alert(result.message || "Product saved");

    form.reset();
    fetchProducts();
});

async function deleteProduct(id) {
    if (!confirm("Really delete?")) return;

    await fetch(`http://${window.location.hostname}:3000/api/products/${id}`, {
        method: 'DELETE'
    });

    fetchProducts();
}

window.addEventListener('DOMContentLoaded', fetchProducts);