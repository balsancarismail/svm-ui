const domain = 'ismailsancar.com'; // Backend domain'i

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signupForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const url = `https://${domain}/api/register`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            const url = `https://${domain}/api/login`;

            // Konum bilgilerini al
            let lat = 0.0;
            let lng = 0.0;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async function (position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;

                    // Konum bilgileriyle birlikte login isteği gönder
                    await sendLoginRequest(url, email, password, lat, lng);
                }, async function (error) {
                    console.error('Error getting location:', error);
                    // Konum alınamazsa 0.0 olarak gönder
                    await sendLoginRequest(url, email, password, lat, lng);
                });
            } else {
                // Geolocation desteklenmiyorsa 0.0 olarak gönder
                await sendLoginRequest(url, email, password, lat, lng);
            }
            window.location.href = 'index.html';
        } else {
            alert('Sign up failed!');
        }
    })
});