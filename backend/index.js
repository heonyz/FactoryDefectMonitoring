const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { configureLogger } = require('./config/logger');
const { configureDatabase } = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const defectRoutes = require('./routes/defectRoutes');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const logger = configureLogger();
const pool = configureDatabase(logger);

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

app.use('/auth', authRoutes);
app.use('/devices', deviceRoutes);
app.use('/defects', defectRoutes);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
