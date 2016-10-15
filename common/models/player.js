'use strict';
const WHITE_LIST_FIELDS = ['total', 'id', 'username', 'daily'];


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

  Player.observe('loaded', function calculateTotal(ctx, next) {
    // console.log(ctx);
    const Drink = Player.app.models.Drink;
    if (!ctx.instance) {
      return next();
    }
    var sum = 0;
    const DRINK_SEARCH = {
      where: {
        playerId: ctx.instance.id,
      },
      fields: {
        amount: true,
      },
    };

    Drink.find(DRINK_SEARCH, function(err, drinks) {
      if (err) return next(err);
      ctx.instance.total = drinks.reduce((result, {amount}) => result + amount, 0);
      return next();
    });

  });

  Player.afterRemote('find', whiteListData);
  Player.afterRemote('findOne', whiteListData);
  Player.afterRemote('findById', function(ctx, modelInstance, next){
    if(ctx.req.accessToken && ctx.req.accessToken.userId.equals(ctx.result.id)) {
      next();
    } else {
      whiteListData(ctx, modelInstance, next);
    }
  });
};

function whiteListData(ctx, modelInstance, next) {
  if (ctx.result) {
    if (Array.isArray(modelInstance)) {
      ctx.result = ctx.result.map(mapResult);
    } else {
      ctx.result = mapResult(ctx.result);
    }
  }
  next();
}


function mapResult(result){
  return WHITE_LIST_FIELDS.reduce((replacement, field) => {
    replacement[field] = result[field];
    return replacement;
  }, {});
}
