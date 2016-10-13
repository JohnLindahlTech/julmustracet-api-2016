'use strict';

module.exports = function(Player) {
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
};
