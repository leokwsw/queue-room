const express = require('express');
const queueRoute = require('./queue.route');
const settingRoute = require('./setting.route');

const router = express.Router();

const routes = [
  {
    path: '',
    route: queueRoute,
  },
  {
    path: '',
    route: settingRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = {
  router,
  routes,
};
