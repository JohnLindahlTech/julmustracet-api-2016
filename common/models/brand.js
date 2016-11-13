'use strict';

const { generateDrinkSearch, calculateTotal } = require('../helpers');

module.exports = function(Brand) {

  Brand.disableRemoteMethod('upsert', true);
  Brand.disableRemoteMethod('updateAll', true);

  Brand.disableRemoteMethod('__create__drinks', false);
  Brand.disableRemoteMethod('__destroyById__drinks', false);
  Brand.disableRemoteMethod('__findById__drinks', false);
  Brand.disableRemoteMethod('__updateById__drinks', false);

  Brand.disableRemoteMethod('replaceById', false);
  Brand.disableRemoteMethod('replaceOrCreate', true);
  Brand.disableRemoteMethod('upsertWithWhere', true);
  Brand.disableRemoteMethod('createChangeStream', true);
  Brand.validatesLengthOf('name', {max: 100});
  Brand.validatesUniquenessOf('name');

  Brand.observe('before save', beforeSave);

  function beforeSave(ctx) {
    if(ctx.instance) {
      return updateTotal(ctx.instance, ctx.instance);
    } else {
      return updateTotal(ctx.data, ctx.currentInstance);
    }
  }

  function updateTotal(instance, reference) {
    return reference.drinks.getAsync()
    .then(calculateTotal)
    .then(total => {
      instance.total = total;
    });
  }
}
