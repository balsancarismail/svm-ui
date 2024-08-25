const domain = 'ismailsancar.com'; // Backend domain'i

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signupForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const url = `https://${domain}/api/users`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            window.location.href = 'login.html';
        } else {
            alert('Sign up failed!');
        }
    })
});