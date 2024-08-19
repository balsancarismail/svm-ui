let socket;
var map;  // Global olarak map tanımla
var user; // Global olarak user tanımla
const domain = 'ismailsancar.com'; // Backend domain'i

function initializeMap() {
    map = L.map('map').setView([51.505, -0.09], 13); // Varsayılan konum (Londra)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    map.on('click', function (e) {
        selectedLatLng = e.latlng; // Tıklanan konumu al
        document.getElementById('locationModal').style.display = 'block';
    });
}

function initializeWebSocket(userId) {
    const innerSocket = new WebSocket(`wss://${domain}/ws?user_id=${userId}`);

    innerSocket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        // localStorage'dan kullanıcı bilgilerini al
        user = JSON.parse(localStorage.getItem('user'));
        const friend = user.friends.find(f => f === data.email);

        var locationIcon = L.icon({
            iconUrl: 'images/friend_icon.png', // İkon dosyasının yolu
            iconSize: [50, 50], // İkon boyutu (genişlik, yükseklik)
            iconAnchor: [25, 50], // İkonun konumunu haritada nereden hizalayacağı (x, y)
            popupAnchor: [0, -50] // Pop-up'ın ikonla hizalanma noktası (x, y)
        });

        if (friend) {
            if (localStorage.getItem(`friend_${data.userId}_lat`) && localStorage.getItem(`friend_${data.userId}_lng`)) {

                //Eğer arkadaşın son konumu varsa, localStorage'dan al ve eğer konumu değişmişse haritaya ekleme

                const lastLat = localStorage.getItem(`friend_${data.userId}_lat`);
                const lastLng = localStorage.getItem(`friend_${data.userId}_lng`);

                if (lastLat !== data.lat || lastLng !== data.lng) {
                    setFriendLastLocation(data.userId, data.lat, data.lng);

                    // Arkadaşın konumunu haritada güncelle
                    L.marker([data.lat, data.lng], { icon: locationIcon }).addTo(map)
                        .bindPopup(`${data.name} is here!`) // friend.name ile arkadaşın ismini gösteriyoruz
                        .openPopup();
                }
                else {
                    console.log('Friend location is same');
                }
            }
            else {
                // Arkadaşın son konumu yoksa, arkadaşın konumunu localStorage'a kaydet
                setFriendLastLocation(data.userId, data.lat, data.lng);

                // Arkadaşın konumunu haritada göster
                L.marker([data.lat, data.lng], { icon: locationIcon }).addTo(map)
                    .bindPopup(`${data.name} is here!`) // friend.name ile arkadaşın ismini gösteriyoruz
                    .openPopup();
            }
        }
    };

    innerSocket.onclose = function () {
        console.log('WebSocket connection closed');
    };

    socket = innerSocket;
}

// Kullanıcının konumunu WebSocket üzerinden göndermek için fonksiyon
function sendLocation(user) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            if (socket.readyState !== 1) {
                initializeWebSocket(user.id);
            }

            // Kullanıcının konumunu WebSocket üzerinden gönder
            if (socket && socket.readyState === 1) {
                socket.send(JSON.stringify({
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    lat: lat,
                    lng: lng
                }));
            }
        });
    }
}
function setFriendLastLocation(friendId, lat, lng) {

    // Arkadaşın son konumunu localStorage'a kaydet
    localStorage.setItem(`friend_${friendId}_lat`, lat);
    localStorage.setItem(`friend_${friendId}_lng`, lng);

}
