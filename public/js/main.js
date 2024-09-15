// Menu toggle functionality
function toggleMenu() {
    const menu = document.getElementById("mySidemenu");
    const body = document.body;
    const isMenuOpen = menu.style.left === "0px";

    menu.style.left = isMenuOpen ? "-250px" : "0";
    body.style.marginLeft = isMenuOpen ? "0" : "250px";
}

// Friend search functionality
function searchFriends() {
    const input = document.getElementById('friendSearchInput').value.toLowerCase();
    const resultsContainer = document.getElementById('friendSearchResults');
    const user = JSON.parse(localStorage.getItem('user'));

    resultsContainer.innerHTML = '';

    if (input === '') return;

    const filteredFriends = user.friends.filter(friend => 
        friend.name.toLowerCase().includes(input)
    );

    if (filteredFriends.length === 0) {
        resultsContainer.innerHTML = '<li>No friends found</li>';
        return;
    }

    const createFriendListItem = (friend) => {
        const li = document.createElement('li');
        li.textContent = friend.name;
        li.addEventListener('click', () => focusOnFriend(friend));
        return li;
    };

    resultsContainer.append(...filteredFriends.map(createFriendListItem));
}

// Focus on friend's location
function focusOnFriend(friend) {
    if (friend.lat && friend.lng) {
        map.setView([friend.lat, friend.lng], 13);
        L.marker([friend.lat, friend.lng], { icon: locationIcon }).addTo(map)
            .bindPopup(`${friend.name} is here!`)
            .openPopup();
    }
}

// Main functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('Map script loaded');

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));

    initializeMap();
    initializeWebSocket(user.id);

    // Send user location every 10 seconds
    setInterval(() => sendLocation(user), 10000);

    // Initial location send
    sendLocation(user);

    // Initialize WebSocket if not already connected
    if (!socket) {
        initializeWebSocket(user.id);
    }

    // Get user's current location and focus map
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude: lat, longitude: lng } = position.coords;
                focusMapOnLocation(lat, lng);
                addUserMarker(lat, lng);
                addStoredLocationsToMap();
            },
            () => {
                map.setView([51.505, -0.09], 13);
                alert("Unable to retrieve your location. Default location set to London.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }

    // Event Listeners
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    document.getElementById('createAreaButton').addEventListener('click', createArea);
    document.getElementById('searchFriendsLink').addEventListener('click', toggleSearchFriends);
    window.onclick = handleOutsideClick;
});

// Helper functions
function focusMapOnLocation(lat, lng) {
    map.setView([lat, lng], 13);
}

function addUserMarker(lat, lng) {
    const locationIcon = L.icon({
        iconUrl: 'images/here_icon.png',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50]
    });

    L.marker([lat, lng], { icon: locationIcon }).addTo(map)
        .bindPopup("You are here!")
        .openPopup();
}

function addStoredLocationsToMap() {
    const locations = JSON.parse(localStorage.getItem('user')).locations;

    if (locations && locations.length > 0) {
        locations.forEach(location => {
            const { latitude: lat, longitude: lng } = location;
            const customIcon = L.icon({
                iconUrl: 'images/dest_icon.png',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });

            L.marker([lat, lng], { icon: customIcon }).addTo(map)
                .bindPopup(`Stored location: (${lat}, ${lng})`);
        });
    }
}

async function handleLogout() {
    const refreshToken = localStorage.getItem('refreshToken');
    const user = JSON.parse(localStorage.getItem('user'));
    const url = `https://${domain}/api/logout`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, refresh_token: refreshToken })
        });

        if (response.ok) {
            ['accessToken', 'refreshToken', 'user'].forEach(item => localStorage.removeItem(item));
            window.location.href = 'login.html';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        alert(error.message);
    }
}

function createArea() {
    const locations = JSON.parse(localStorage.getItem('user')).locations;

    if (locations && locations.length > 2) {
        const points = locations.map(location => [location.longitude, location.latitude]);
        const turfPoints = turf.points(points);
        const convexHull = turf.convex(turfPoints);

        if (convexHull) {
            const latlngs = convexHull.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);

            const polygon = L.polygon(latlngs, {
                color: 'blue',
                weight: 4,
                opacity: 0.7,
                fillColor: 'yellow',
                fillOpacity: 0.5,
                dashArray: '5, 5',
                lineCap: 'round',
                lineJoin: 'round',
                className: 'custom-polygon'
            }).addTo(map);

            polygon.bindPopup("This is your selected area.");
        } else {
            alert('Unable to create a convex hull from the given points.');
        }
    } else {
        alert('Creating an area requires at least 3 locations.');
    }
}

function toggleSearchFriends() {
    const searchContainer = document.getElementById('searchFriendsContainer');
    searchContainer.style.display = searchContainer.style.display === 'none' || searchContainer.style.display === '' ? 'block' : 'none';
}

function handleOutsideClick(event) {
    const searchContainer = document.getElementById('searchFriendsContainer');
    if (event.target === searchContainer) {
        searchContainer.style.display = 'none';
    }
}