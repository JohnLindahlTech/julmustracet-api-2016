

const { disableAllExcept } = require('../helpers/disableMethods');
const app = require('../../server/server');

function find(filter, cb) {
  return cb(null, app.get('rules'));
}

module.exports = function (Rules) {
  disableAllExcept(Rules, ['find']);

  Rules.once('attached', () => {
    Object.assign(Rules, { find });
  });
};
