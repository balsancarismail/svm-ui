document.getElementById('profileForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Basic validation (optional)
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Send data to the server or handle form submission
    console.log({
        name: name,
        email: email,
        password: password
    });

    // Example: Display a success message
    alert('Profile updated successfully!');
});