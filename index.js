const ctl = require('ctl');
const http = require('http');
const express = require('express');
const compress = require('compression');
const body = require('body-parser');

const config = require('ctl/config');
const log = require('ctl/logging')('server');
const views = require('./views');
const settings = ctl.settings({ 'static': 'static' });

exports.create = function () {
  const app = express();
  app.set('env', config.env);
  if (config.env === 'prod') {
    app.set('trust proxy', 1);
  }
  app.set('x-powered-by', false);
  if (config.staticUrl.startsWith('/')) {
    app.use(config.staticUrl, express.static(`${settings.src}/${settings.static}`));
  }
  app.use(compress());
  app.use(body.json({ limit: '25mb' }));
  app.use(log.morgan());
  app.set('view engine', 'html');
  app.views = views.setup(app);
  app.use((req, res, next) => {
    res.locals = views.locals();
    next();
  });
  return app;
};

exports.run = async (app) => {
  const server = http.createServer(app);
  await server.listen(config.port);
  const host = server.address().address;
  log.info('Server started listening at http://%s:%s', host, config.port);
};

exports.json = require('./json-wrapper');
