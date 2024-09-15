const domain = 'ismailsancar.com';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
});

async function handleSignup(event) {
    event.preventDefault();

    const formData = getFormData();
    const registerUrl = `https://${domain}/api/register`;

    try {
        await registerUser(registerUrl, formData);
        await loginUser(formData.email, formData.password);
    } catch (error) {
        alert('Sign up failed: ' + error.message);
    }
}

function getFormData() {
    return {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
}

async function registerUser(url, userData) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }
}

async function loginUser(email, password) {
    const loginUrl = `https://${domain}/api/login`;
    const position = await getCurrentPosition();
    await sendLoginRequest(loginUrl, email, password, position.latitude, position.longitude);
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            resolve({ latitude: 0.0, longitude: 0.0 });
        } else {
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }),
                error => {
                    console.error('Error getting location:', error);
                    resolve({ latitude: 0.0, longitude: 0.0 });
                }
            );
        }
    });
}