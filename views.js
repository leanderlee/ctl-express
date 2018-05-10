const ctl = require('ctl');
const nunjucks = require('nunjucks');
const config = require('ctl/config');
const settings = ctl.settings({ views: 'views' });

exports.setup = (app) => {
  return nunjucks.configure(`${settings.src}/${settings.views}`, {
    express: app,
    noCache: (config.env === 'local'),
  });
};

exports.locals = () => {
  return {
    host: config.host,
    staticUrl: config.staticUrl,
  };
};
