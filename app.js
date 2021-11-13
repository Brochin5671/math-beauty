const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const liveReload = require('livereload');
const connectLiveReload = require('connect-livereload');

// Setup app and port
const app = express();
const port = process.env.PORT || 443;

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

// Create livereload server when not in production
if (process.env.NODE_ENV !== 'production') {
    const liveReloadServer = liveReload.createServer();
    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/');
        }, 100);
    });
    app.use(connectLiveReload());
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
