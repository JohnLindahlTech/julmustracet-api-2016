

const { updateTotal, updatePositions, calculateDaily } = require('../helpers');

module.exports = (Brand) => {
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
  Brand.validatesLengthOf('name', { max: 100 });
  Brand.validatesUniquenessOf('name');

  Brand.observe('before save', updateTotal);

  Brand.observe('after save', updatePositions);
  Brand.afterRemote('**', calculateDaily);
};
