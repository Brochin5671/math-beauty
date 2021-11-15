const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

// Setup app and port
const app = express();
const port = process.env.PORT || 3000;

// Use compression and helmet for http headers
app.use(compression());
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", 'cdn.jsdelivr.net', 'localhost:35729'],
                'connect-src': ['ws://localhost:35729'],
                styleSrc: ["'self'", 'cdn.jsdelivr.net'],
                upgradeInsecureRequests: [],
            },
        },
    })
);

// Redirect to secure if request is not secure and not localhost
if (port == process.env.PORT) {
    app.enable('trust proxy'); // Enable reverse proxy support
    app.use((req, res, next) => {
        if (req.secure) next();
        else res.redirect(301, `https://${req.headers.host}${req.url}`);
    });
}

// Serves js and css
app.use(express.static('public/js'));
app.use(express.static('public/css'));

// Serve index page
app.get('/', (_, res) => {
    res.sendFile(`${__dirname}/public/html/index.html`);
});

// Redirect to home if page not found
app.get('*', (_, res) => {
    res.redirect('/');
});

// Listen on port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
