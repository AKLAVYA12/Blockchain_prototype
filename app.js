const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const multer = require("multer");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const FormData = require("form-data");
const path = require('path');

const app = express();
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

require('dotenv').config();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    routes: {
        login: false,
        callback: '/callback',
        postLogoutRedirect: '/'
    }
};

app.use(auth(config));

app.get('/', (req, res) => {
    if (req.oidc.isAuthenticated()) {
        return res.redirect('/profile');
    }
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
    res.oidc.login({
        returnTo: '/profile'
    });
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.render('dashboard', { user: req.oidc.user });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port " + (process.env.PORT));
});


app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const fileStream = fs.createReadStream(req.file.path);
        const formData = new FormData();
        formData.append("file", fileStream, req.file.originalname);

        // ✅ Important: include form-data headers
        const headers = {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
            ...formData.getHeaders(),
        };

        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers,
            body: formData,
        });

        const result = await response.json();
        fs.unlinkSync(req.file.path); // cleanup

        console.log("✅ Uploaded to Pinata:", result);
        res.json(result);
    } catch (error) {
        console.error("❌ Upload error:", error);
        res.status(500).json({ error: "Failed to upload file to Pinata" });
    }
});
