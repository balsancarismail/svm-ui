let socket;
let map;
let user;
const domain = 'ismailsancar.com';

function initializeMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    map.on('click', function (e) {
        selectedLatLng = e.latlng;
        document.getElementById('locationModal').style.display = 'block';
    });
}

function initializeWebSocket(userId) {
    const innerSocket = new WebSocket(`wss://${domain}/ws?user_id=${userId}`);

    innerSocket.onmessage = handleWebSocketMessage;
    innerSocket.onclose = () => console.log('WebSocket connection closed');

    socket = innerSocket;
}

function handleWebSocketMessage(event) {
    const data = JSON.parse(event.data);
    user = JSON.parse(localStorage.getItem('user'));
    const friend = user.friends.find(f => f === data.email);

    if (friend) {
        updateFriendLocation(data);
    }
}

function updateFriendLocation(data) {
    const lastLocation = getFriendLastLocation(data.userId);
    const newLocation = { lat: data.lat, lng: data.lng };

    if (!lastLocation || hasLocationChanged(lastLocation, newLocation)) {
        setFriendLastLocation(data.userId, newLocation.lat, newLocation.lng);
        addFriendMarkerToMap(data);
    } else {
        console.log('Friend location is same');
    }
}

function getFriendLastLocation(friendId) {
    const lat = localStorage.getItem(`friend_${friendId}_lat`);
    const lng = localStorage.getItem(`friend_${friendId}_lng`);
    return lat && lng ? { lat, lng } : null;
}

function hasLocationChanged(lastLocation, newLocation) {
    return lastLocation.lat !== newLocation.lat || lastLocation.lng !== newLocation.lng;
}

function addFriendMarkerToMap(data) {
    const locationIcon = L.icon({
        iconUrl: 'images/friend_icon.png',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50]
    });

    L.marker([data.lat, data.lng], { icon: locationIcon }).addTo(map)
        .bindPopup(`${data.name} is here!`)
        .openPopup();
}

function sendLocation(user) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude: lat, longitude: lng } = position.coords;

            if (socket.readyState !== WebSocket.OPEN) {
                initializeWebSocket(user.id);
            }

            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ userId: user.id, name: user.name, email: user.email, lat, lng }));
            }
        });
    }
}

function setFriendLastLocation(friendId, lat, lng) {
    localStorage.setItem(`friend_${friendId}_lat`, lat);
    localStorage.setItem(`friend_${friendId}_lng`, lng);
}
