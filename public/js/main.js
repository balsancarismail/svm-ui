
function toggleMenu() {
    const menu = document.getElementById("mySidemenu");
    const body = document.body;

    if (menu.style.left === "0px") {
        menu.style.left = "-250px";
        body.style.marginLeft = "0";
    } else {
        menu.style.left = "0";
        body.style.marginLeft = "250px"; // Sayfayı sağa kaydırma
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('Map script loaded'); // Kontrol amaçlı log

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));

    initializeMap(); // Haritayı başlat

    initializeWebSocket(user.id); // WebSocket'i başlat

    // Kullanıcının konumunu her 10 saniyede bir göndermek için interval ayarla
    setInterval(function () {
        sendLocation(user);
    }, 10000);

    // Haritayı kullanıcının mevcut konumuna odakla ve başlangıçta bir konum gönder
    sendLocation(user);

    // WebSocket bağlantısını başlat ve user_id'yi URL parametresi olarak ekle
    if (!socket) {
        initializeWebSocket(user.id);
    }

    // Kullanıcının mevcut konumunu al ve haritayı oraya odakla
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            map.setView([lat, lng], 13); // Konuma odaklan

            var locationIcon = L.icon({
                iconUrl: 'images/here_icon.png',
                iconSize: [50, 50],
                iconAnchor: [25, 50],
                popupAnchor: [0, -50]
            });

            L.marker([lat, lng], { icon: locationIcon }).addTo(map)
                .bindPopup("You are here!")
                .openPopup();

            // LocalStorage'dan diğer konumları alıp haritaya ekleme
            addStoredLocationsToMap();

        }, function () {
            map.setView([51.505, -0.09], 13);
            alert("Unable to retrieve your location. Default location set to London.");
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }

    // LocalStorage'dan konumları alıp haritaya ekleme fonksiyonu
    function addStoredLocationsToMap() {
        // LocalStorage'dan konum verilerini alın
        const locations = JSON.parse(localStorage.getItem('user')).locations;

        if (locations && locations.length > 0) {
            locations.forEach(function (location) {
                var lat = location.latitude;
                var lng = location.longitude;

                var customIcon = L.icon({
                    iconUrl: 'images/dest_icon.png', // Özel ikonun yolu
                    iconSize: [40, 40], // İkon boyutu
                    iconAnchor: [20, 40], // İkonun konumunu haritada nereden hizalayacağı (x, y)
                    popupAnchor: [0, -40] // Pop-up'ın ikonla hizalanma noktası (x, y)
                });

                L.marker([lat, lng], { icon: customIcon }).addTo(map)
                    .bindPopup(`Stored location: (${lat}, ${lng})`);
            });
        }
    }

    // Logout işlemi
    document.getElementById('logoutButton').addEventListener('click', async function () {
        const refreshToken = localStorage.getItem('refreshToken');
        const url = `https://${domain}/api/users/logout`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, refresh_token: refreshToken })
        });

        if (response.ok) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        } else {
            alert('Logout failed!');
        }
    });

    // Alan oluşturma fonksiyonu
    document.getElementById('createAreaButton').addEventListener('click', function () {
        const locations = JSON.parse(localStorage.getItem('user')).locations;

        if (locations && locations.length > 2) { // Alan oluşturmak için en az 3 nokta gerekli
            const points = locations.map(function (location) {
                return [location.longitude, location.latitude]; // GeoJSON formatı (lng, lat)
            });

            const turfPoints = turf.points(points); // Turf.js kullanarak noktaları oluştur
            const convexHull = turf.convex(turfPoints); // Dışbükey alanı oluştur

            if (convexHull) {
                // Leaflet polygon olarak dışbükey alanı çizme
                const latlngs = convexHull.geometry.coordinates[0].map(function (coord) {
                    return [coord[1], coord[0]]; // Leaflet formatı (lat, lng)
                });

                const polygon = L.polygon(latlngs, {
                    color: 'blue',          // Sınır çizgisinin rengi
                    weight: 4,              // Sınır çizgisinin kalınlığı
                    opacity: 0.7,           // Sınır çizgisinin saydamlığı
                    fillColor: 'yellow',    // Doldurma rengi
                    fillOpacity: 0.5,       // Doldurma saydamlığı
                    dashArray: '5, 5',      // Kesikli çizgi
                    lineCap: 'round',       // Çizgi uçları yuvarlatılmış
                    lineJoin: 'round',      // Çizgi köşeleri yuvarlatılmış
                    className: 'custom-polygon' // Özel CSS sınıfı
                }).addTo(map);

                polygon.bindPopup("This is your selected area.");
            } else {
                alert('Unable to create a convex hull from the given points.');
            }
        } else {
            alert('Creating an area requires at least 3 locations.');
        }
    });
});