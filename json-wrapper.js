const ctl = require('ctl');
const path = require('path');
const fs = require('fs-extra');
const log = require('ctl/logging')('api');

function wrap(controller) {
  const wrapped = {};
  Object.keys(controller).forEach((key) => {
    const handler = controller[key];
    if (typeof handler !== 'function') return;
    wrapped[key] = async (req, res) => {
      try {
        const result = await handler(req);
        if (result === true) {
          res.status(204).end();
        } else {
          res.status(200).json(result);
        }
      } catch (e) {
        const { message = 'server_crashed' } = e;
        log.error(req.method, req.url, e);
        if (message === 'forbidden') {
          res.status(403).json({ message });
        } else if (message === 'not_found') {
          res.status(404).json({ message });
        } else if (message === 'unauthorized') {
          res.status(401).json({ message });
        } else if (message.startsWith('failed_') || message.startsWith('server_')) {
          res.status(500).json({ message });
        } else {
          res.status(400).json({ message });
        }
      }
    };
  });
  return wrapped;
}

module.exports = function () {
  const dir = ctl.dirname();
  const contents = fs.readdirSync(dir);
  const result = {};
  contents.forEach((file) => {
    const ext = path.extname(file);
    if (ext !== '.js') return;
    const name = path.basename(file, ext);
    if (name === 'index') return;
    result[name] = wrap(require(`${dir}/${file}`));
  });
  return result;
}
