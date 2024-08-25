
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
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
});

async function sendLoginRequest(url, email, password, lat, lng) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, lat, lng })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);

        localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            friends: data.user.friends, // Kullanıcının arkadaşları
            locations: data.user.locations // Kullanıcının konumları
        }));

        window.location.href = 'index.html';
    } else {
        alert('Login failed!');
    }
}
