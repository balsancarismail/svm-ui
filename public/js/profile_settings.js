document.getElementById('profileForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirm-password').value
    };

    if (!validateForm(formData)) return;

    try {
        await updateProfile(formData);
        displaySuccessMessage('Profile updated successfully!');
    } catch (error) {
        displayErrorMessage(error.message);
    }
});

function validateForm(formData) {
    if (formData.password !== formData.confirmPassword) {
        displayErrorMessage('Passwords do not match!');
        return false;
    }
    return true;
}

async function updateProfile(formData) {
    const response = await fetch(`https://${domain}/api/update-profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw new Error('Failed to update profile');
    }

    return response.json();
}

function displaySuccessMessage(message) {
    alert(message);
}

function displayErrorMessage(message) {
    alert(message);
}