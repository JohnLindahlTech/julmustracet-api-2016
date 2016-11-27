const app = require('../../server/server');

const {
  startDate,
  endDate,
  year,
  minAmount,
  maxAmount,
} = app.get('rules');

function getRules(cb) {
  cb(null, { startDate, endDate, year, minAmount, maxAmount });
}

module.exports = (Rules) => {
  Rules.getRules = getRules; // eslint-disable-line no-param-reassign
  Rules.remoteMethod(
    'getRules',
    {
      http: { path: '/', verb: 'get' },
      returns: { arg: 'rules', type: 'Object', root: true },
    });
};
