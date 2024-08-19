const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();

// SSL Sertifikası ve Anahtar Dosyaları
const options = {
    key: fs.readFileSync('192.168.1.2-key.pem'),
    cert: fs.readFileSync('192.168.1.2.pem')
};

// Statik dosyaları sunmak için public klasörünü kullanıyoruz
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// HTTPS sunucusunu başlatıyoruz
https.createServer(options, app).listen(8081, () => {
    console.log('Server is running on https://192.168.1.2:8081');
});