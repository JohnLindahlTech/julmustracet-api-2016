const calculateTotal = require('./calculateTotal');
const { disableAllExcept, disableOnlyTheseMethods} = require('./disableMethods');
const updatePositions = require('./updatePositions');
const whiteListPlayer = require('./whiteListPlayer');
const generateDrinkSearch = require('./generateDrinkSearch');

module.exports = {
  calculateTotal,
  disableAllExcept,
  disableOnlyTheseMethods,
  updatePositions,
  whiteListPlayer,
  generateDrinkSearch
}
