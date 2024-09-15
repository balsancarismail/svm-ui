let selectedLatLng;

const closeModal = () => {
    document.getElementById('locationModal').style.display = 'none';
};

const sendLocationToBackend = async (locationData) => {
    const url = `https://${domain}/api/users/location`;
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(locationData)
        });

        if (!response.ok) {
            throw new Error('Failed to save location');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const updateUserLocations = (newLocation) => {
    const user = JSON.parse(localStorage.getItem('user'));
    user.locations.push(newLocation);
    localStorage.setItem('user', JSON.stringify(user));
};

const addMarkerToMap = (latLng) => {
    const customIcon = L.icon({
        iconUrl: 'images/dest_icon.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    L.marker(latLng, { icon: customIcon })
        .addTo(map)
        .bindPopup("You marked this location!")
        .openPopup();
};

document.querySelector('.close').onclick = closeModal;

document.getElementById('confirmButton').onclick = async function () {
    closeModal();

    const user = JSON.parse(localStorage.getItem('user'));
    const locationData = {
        user_id: user.id,
        latitude: parseFloat(selectedLatLng.lat.toFixed(6)),
        longitude: parseFloat(selectedLatLng.lng.toFixed(6))
    };

    try {
        const data = await sendLocationToBackend(locationData);
        if (data) {
            updateUserLocations(locationData);
            addMarkerToMap(selectedLatLng);
        } else {
            alert('There was an error saving the location.');
        }
    } catch (error) {
        alert('Failed to save location. Please try again.');
    }
};