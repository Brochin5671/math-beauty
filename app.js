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

// Serves js, css and favicons
app.use(express.static('public/js'));
app.use(express.static('public/css'));
app.use(express.static('public/favicons'));

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
