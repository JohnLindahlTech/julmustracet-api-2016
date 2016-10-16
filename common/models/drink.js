'use strict';

const whiteListPlayer = require('../helpers/whiteListPlayer');

module.exports = function(Drink) {
  Drink.disableRemoteMethod('upsert', true);
  Drink.disableRemoteMethod('updateAll', true);

  Drink.disableRemoteMethod('replaceById', false);
  Drink.disableRemoteMethod('replaceOrCreate', true);
  Drink.disableRemoteMethod('upsertWithWhere', true);
  Drink.disableRemoteMethod('createChangeStream', true);
  Drink.disableRemoteMethod('__get__player', false);
  Drink.disableRemoteMethod('__get__brand', false);


  Drink.observe('after save', updateSaveTotals);
  Drink.observe('before delete', storeAwayData);
  Drink.observe('after delete', updateDeleteTotals);
};

function storeAwayData(ctx, next){
  const Drink = ctx.Model;
  Drink.find({where: ctx.where}).then(drinks => {
    ctx.hookState.players = drinks.map(drink => drink.player);
    ctx.hookState.brands = drinks.map(drink => drink.brand);
  }).then(()=> next()).catch(next);
}

function updateDeleteTotals(ctx, next) {
  const Drink = ctx.Model;
  const { players, brands } = ctx.hookState;
  Promise.all([
    ...players.map(player => {
      const PLAYER_DRINK_SEARCH = generateDrinkSearch({ playerId: player.id });
      return Drink.find(PLAYER_DRINK_SEARCH, calculateTotal(player));
    }),
    ...brands.map(brand => {
      const BRANDS_DRINK_SEARCH = generateDrinkSearch({ brandId: brand.id });
      return Drink.find(BRANDS_DRINK_SEARCH, calculateTotal(brand));
    })
  ]).then(() => next()).catch(next);
}


function updateSaveTotals(ctx, next) {
  const Drink = ctx.Model;
  if (!ctx.instance) {
    return next();
  }
  const { player, brand } = ctx.instance;
  const PLAYER_DRINK_SEARCH = generateDrinkSearch({ playerId: player.id });
  const BRANDS_DRINK_SEARCH = generateDrinkSearch({ brandId: brand.id });

  Promise.all([
    Drink.find(PLAYER_DRINK_SEARCH, calculateTotal(player)),
    Drink.find(BRANDS_DRINK_SEARCH, calculateTotal(brand))
  ]).then(() => next()).catch(next);
}

function calculateTotal(model){
  return (err, drinks) => {
    if (err) throw err;
    const total = drinks.reduce((result, {amount}) => result + amount, 0);
    return model.update({total});
  }
}

function generateDrinkSearch(where){
  return {
    where,
    field: {
      amount: true,
    }
  };
}
