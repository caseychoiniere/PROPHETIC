const agentToken = require('./routes/agentToken');
const userResponse = require('./routes/userResponse');
const trialData = require('./routes/trialData');
const cors = require('cors');
const corsOptions = { origin: '*' };
const bodyParser = require('body-parser');
if (!process.env.NODE_ENV) require('dotenv').load();
const dbConfig = require('./db');
const express = require('express');
const helmet = require('helmet');
const morgan = require("morgan");
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Priority serve any static files.
app.use(
    express.static(path.resolve(__dirname, '../client/build')),
    cors(corsOptions),
    helmet(),
    morgan('dev'),
    bodyParser.urlencoded({extended: false}),
    bodyParser.json()
);

mongoose.connect(dbConfig.DB, { useNewUrlParser: true }).then(
    () => {console.log('Database is connected') },
    err => {console.log('Cannot connect to the database' +err)}
);

app.use('/api/agent-token', agentToken);
app.use('/api/user-response', userResponse);
app.use('/api/trial-data', trialData);

// All remaining requests return the React app, so it can handle routing.
app.get('/*', (request, response) => {
    response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));