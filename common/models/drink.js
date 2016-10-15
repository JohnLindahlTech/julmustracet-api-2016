'use strict';

module.exports = function(Drink) {
  Drink.disableRemoteMethod('upsert', true);
  Drink.disableRemoteMethod('updateAll', true);

 // Drink.disableRemoteMethod('count', true);
//  Drink.disableRemoteMethod('exists', true);

  Drink.disableRemoteMethod('replaceById', false);
  Drink.disableRemoteMethod('replaceOrCreate', true);
  Drink.disableRemoteMethod('upsertWithWhere', true);
  Drink.disableRemoteMethod('createChangeStream', true); // MIGHT BE NICE if it is basicakky WebSockets.
};
