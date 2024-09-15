// Sayfa yüklendiğinde çalışır
document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Eğer accessToken ve refreshToken varsa, ana sayfaya yönlendir
    if (accessToken && refreshToken) {
        window.location.href = 'index.html';
    }

    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const url = `https://${domain}/api/login`;

        try {
            const position = await getCurrentPosition();
            const { latitude: lat, longitude: lng } = position.coords;
            await sendLoginRequest(url, email, password, lat, lng);
        } catch (error) {
            console.error('Error during login:', error);
            await sendLoginRequest(url, email, password, 0.0, 0.0);
        }
    });

});

async function sendLoginRequest(url, email, password, lat, lng) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, lat, lng })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        saveUserData(data);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login failed:', error);
        showErrorMessage('Login failed. Please try again.');
    }
}

function saveUserData(data) {
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        friends: data.user.friends,
        locations: data.user.locations
    }));
}

function showErrorMessage(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    });
}