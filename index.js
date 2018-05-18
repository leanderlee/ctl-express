const ctl = require('ctl');
const http = require('http');
const express = require('express');
const nunjucks = require('nunjucks');
const compress = require('compression');
const body = require('body-parser');

const settings = ctl.settings({
  host: 'http://localhost:8080',
  views: 'views',
  'static': 'static',
  staticUrl: '/static',
});
const config = ctl.library('config');
const log = ctl.library('logging')('server');

function create() {
  const locals = {
    host: settings.host,
    staticUrl: settings.staticUrl,
  };
  const app = express();
  app.set('x-powered-by', false);
  if (settings.staticUrl.startsWith('/')) {
    app.use(settings.staticUrl, express.static(`${settings.src}/${settings.static}`));
  }
  app.use(compress());
  app.use(body.json({ limit: '25mb' }));
  app.use(log.morgan());
  app.set('view engine', 'html');
  const env = nunjucks.configure(`${settings.src}/${settings.views}`, {
    express: app,
    noCache: !!settings.debug,
  });
  app.use((req, res, next) => {
    res.locals = locals;
    next();
  });

  app.views = {
    render: (view, overrides) => {
      const vars = Object.assign({}, locals, overrides);
      return env.render(view, vars);
    },
  };
  return app;
}

async function run(app) {
  const server = http.createServer(app);
  await server.listen(config.port);
  const host = server.address().address;
  log.info('Server started listening at http://%s:%s', host, config.port);
}

const service = {
  create,
  run,
  json: require('./json-wrapper'),
};

ctl.service(service);
module.exports = service;
