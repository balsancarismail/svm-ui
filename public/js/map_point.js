let selectedLatLng;
const domain = 'ismailsancar.com'; // Backend domain'i

// Modal'ı kapatma
document.querySelector('.close').onclick = function () {
    document.getElementById('locationModal').style.display = 'none';
};

// Kullanıcı "Yes" butonuna tıklarsa
document.getElementById('confirmButton').onclick = function () {
    document.getElementById('locationModal').style.display = 'none';

    // Konumu backend'e gönderme
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const locationData = {
        user_id: userId,
        latitude: parseFloat(selectedLatLng.lat.toFixed(6)),
        longitude: parseFloat(selectedLatLng.lng.toFixed(6))
    };
    body = JSON.stringify(locationData);
    access_token = `Bearer ${localStorage.getItem('accessToken')}`

    const url = `https://${domain}/api/users/location`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': access_token
        },
        body: body
    })
        .then(response => response.json())
        .then(data => {
            if (data) {

                //user' ın konumlarına yeni konumu ekleme
                user = JSON.parse(localStorage.getItem('user'));
                user.locations.push(locationData);
                localStorage.setItem('user', JSON.stringify(user));

                var customIcon = L.icon({
                    iconUrl: 'images/dest_icon.png', // Özel ikonun yolu
                    iconSize: [40, 40], // İkon boyutu
                    iconAnchor: [20, 40], // İkonun konumunu haritada nereden hizalayacağı (x, y)
                    popupAnchor: [0, -40] // Pop-up'ın ikonla hizalanma noktası (x, y)
                });
                // Konumu haritada işaretli bırak
                L.marker(selectedLatLng, { icon: customIcon }).addTo(map)
                    .bindPopup("You marked this location!")
                    .openPopup();
            } else {
                alert('There was an error saving the location.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
};