const app = require('./app');
const { routes } = require('./routes');

routes.forEach((route) => {
  route.route.stack.forEach((layer) => {
    const methods = Object.keys(layer.route.methods).join(' | ').toUpperCase();
    const endpoint = layer.route.path;
    const prefix = route.path;
    console.info(`${methods} - http://localhost:3000${prefix}${endpoint}`);
  });
});

app.listen(3000, () => {
  console.log(`Listening on http://localhost:3000`);
});
