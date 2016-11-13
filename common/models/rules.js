'use strict';
const { disableAllExcept } = require('../helpers/disableMethods');
const app = require('../../server/server');
module.exports = function(Rules) {
  disableAllExcept(Rules, ['find']);

  Rules.once('attached', () => {
    Rules.find = find;
  })

};

function find(filter, cb) {
   return cb(null, app.get('rules'));
}
