'use strict';

module.exports = function(Player) {
  Player.disableRemoteMethod('upsert', true);
  Player.disableRemoteMethod('updateAll', true);

  Player.disableRemoteMethod('__count__accessTokens', false);
  Player.disableRemoteMethod('__create__accessTokens', false);
  Player.disableRemoteMethod('__delete__accessTokens', false);
  Player.disableRemoteMethod('__destroyById__accessTokens', false);
  Player.disableRemoteMethod('__findById__accessTokens', false);
  Player.disableRemoteMethod('__get__accessTokens', false);
  Player.disableRemoteMethod('__updateById__accessTokens', false);

  Player.disableRemoteMethod('createChangeStream', true); // MIGHT BE NICE if it is basicakky WebSockets.
  Player.disableRemoteMethod('replaceOrCreate', true);
  Player.disableRemoteMethod('upsertWithWhere', true);

  Player.observe('loaded', function(ctx, next) {
    if (ctx.instance) {
      var sum = 0;

      Player.app.models.Drink.find({
        where: {
          playerId: ctx.instance.id,
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

  Player.observe('access', function(ctx, next) {

    next();
  });
};
