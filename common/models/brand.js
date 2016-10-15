'use strict';

module.exports = function(Brand) {
  Brand.disableRemoteMethod('upsert', true);
  Brand.disableRemoteMethod('updateAll', true);

 // Brand.disableRemoteMethod('count', true);
//  Brand.disableRemoteMethod('exists', true);

  Brand.disableRemoteMethod('__create__drinks', false);
//  Brand.disableRemoteMethod('__delete__drinks', false); // Admin level
  Brand.disableRemoteMethod('__destroyById__drinks', false);
  Brand.disableRemoteMethod('__findById__drinks', false);
  Brand.disableRemoteMethod('__updateById__drinks', false);

  Brand.disableRemoteMethod('replaceById', false);
  Brand.disableRemoteMethod('replaceOrCreate', true);
  Brand.disableRemoteMethod('upsertWithWhere', true);
  Brand.disableRemoteMethod('createChangeStream', true); // MIGHT BE NICE if it is basicakky WebSockets.

  Brand.observe('loaded', function(ctx, next) {
    if (ctx.instance) {
      var sum = 0;

      Brand.app.models.Drink.find({
        where: {
          brandId: ctx.instance.id,
        },
        fields: {
          amount: true,
        },
      }, function(err, drinks) {
        if (err) return next(err);

        if (drinks.length) {
          drinks.forEach(function(drink) {
            sum += drink.amount;
          });

          ctx.instance.total = sum;
        }

        return next();
      });
    } else {
      return next();
    }
  });
};
