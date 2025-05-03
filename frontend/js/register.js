const form = document.getElementById('registerForm');
const msg = document.getElementById('msg');

// Nutzer drückt auf Registrieren -> Funktion wird gefeuert
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("Submitted!");

    const data = {
        salutation: form.salutation.value,
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        address: form.address.value,
        zipCode: form.zipCode.value,
        city: form.city.value,
        email: form.email.value,
        username: form.username.value,
        password: form.password.value,
        passwordRepeat: form.passwordRepeat.value,
        paymentInfo: form.paymentInfo.value
    };

    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            msg.textContent = "🎉 Registration successful!";
            msg.style.color = "green";
            form.reset();

        } else {
            msg.textContent = "❌ " + (result.error || "Unknown error.");
            msg.style.color = "red";
        }
    } catch (err) {
        msg.textContent = "❌ Server not accessible.";
        msg.style.color = "red";
    }
});