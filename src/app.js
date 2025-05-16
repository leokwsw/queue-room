const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
require('express-async-errors');
const { router } = require('./routes');
const requestIp = require('request-ip');
const middlewares = require('./middlewares');
const configs = require('./configs');

dotenv.config();
const app = express();
const origin = '*';
const corsOptions = {
  origin,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(requestIp.mw());
app.use(middlewares.globalMiddleware);
app.use(middlewares.checkInternalUserMiddleware);
app.use(middlewares.checkMaintenanceMiddleware);
app.use(router);
app.use(express.static('public'))

app.use((err, req, res, next) => {
  if (err.message) {
    res.status(403);
    res.json({ error: err.message });
  }
  next(err);
});

module.exports = app;
