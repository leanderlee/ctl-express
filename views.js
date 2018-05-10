const ctl = require('ctl');
const nunjucks = require('nunjucks');
const config = require('ctl/config');
const settings = ctl.settings({ views: 'views' });

exports.setup = (app) => {
  const env = nunjucks.configure(`${settings.src}/${settings.views}`, {
    express: app,
    noCache: (config.env === 'local'),
  });
  return {
    render: (view, overrides) => {
      const vars = Object.assign({}, views.locals(), overrides);
      return env.render(view, vars);
    },
  }
};

exports.locals = () => {
  return {
    host: config.host,
    staticUrl: config.staticUrl,
  };
};
