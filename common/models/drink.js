'use strict';
const whiteListPlayer = require('../helpers/whiteListPlayer');
const app = require('../../server/server');
const { calculateTotal, updatePositions, generateDrinkSearch } = require('../helpers');
const {
  startDate,
  endDate,
  minAmount,
  maxAmount,
} = app.get('rules');
const start = new Date(startDate);
const end = new Date(endDate);

module.exports = function(Drink) {
  Drink.disableRemoteMethod('upsert', true);
  Drink.disableRemoteMethod('updateAll', true);

  Drink.disableRemoteMethod('replaceById', false);
  Drink.disableRemoteMethod('replaceOrCreate', true);
  Drink.disableRemoteMethod('upsertWithWhere', true);
  Drink.disableRemoteMethod('createChangeStream', true);
  Drink.disableRemoteMethod('__get__player', false);
  Drink.disableRemoteMethod('__get__brand', false);
/*
  Drink.observe('after save', updateSaveTotals);
  Drink.observe('before delete', storeAwayData);
  Drink.observe('after delete', updateDeleteTotals);
*/
  Drink.observe('after save', pokeRelations);
  Drink.once('attached', () => {
    const { Brand } = Drink.app.models;
    const origCreate = Drink.create.bind(Drink);
    Drink.create = (rawDrink, options, done) => {
      if(!rawDrink.brandId && rawDrink.brand) {
        return Brand.find({where: {name: rawDrink.brand}, limit: 1})
          .then(([brand]) => {
            if(brand){
              return brand;
            } else {
              return Brand.create({name: rawDrink.brand});
            }
          }).then((brand) => {
            return Object.assign({}, rawDrink, {brandId: brand.id});
          }).then((drink) => origCreate(drink, options, done)).catch(done);
      } else {
        return origCreate(rawDrink, options, done);
      }
    }
  });

  Drink.validatesLengthOf('brand', {max: 100});

  Drink.validate('amount', customValidate(amountLessThanMin));
  Drink.validate('amount', customValidate(amountMoreThanMax));
  Drink.validate('date', customValidate(dateLessThanStart));
  Drink.validate('date', customValidate(dateMoreThanEndOrCurrent));

  function pokeRelations(ctx, next) {
    if(ctx.instance){
      const {player, brand} = ctx.instance;
      return Promise.all([
        player.getAsync().then(touchModel),
        brand.getAsync().then(touchModel)
      ]);
    } else {
      ctx.data
    }
    next();
  }
};


function touchModel(model){
  model.touched = new Date();
  return model.save();
}

function customValidate(evalFn){
  return function(err) {
      if(evalFn(this)) err();
  }
}

function amountLessThanMin(drink) {
  return drink.amount < minAmount;
}

function amountMoreThanMax(drink) {
  return drink.amount > maxAmount;
}

function dateLessThanStart(drink) {
  return drink.date.getTime() < start.getTime();
}

function dateMoreThanEndOrCurrent(drink) {
  const maxDate = getEarliestDate(new Date(), endDate);
  return drink.date.getTime() > maxDate.getTime();
}

function getEarliestDate(...dates) {
  return new Date(Math.min.apply(null, dates));
}

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
      return Drink.find(PLAYER_DRINK_SEARCH).then(calculateTotal(player));
    }),
    ...brands.map(brand => {
      const BRANDS_DRINK_SEARCH = generateDrinkSearch({ brandId: brand.id });
      return Drink.find(BRANDS_DRINK_SEARCH).then(calculateTotal(brand));
    })
  ])
  .then(()=> updateAllPositions(ctx));
}



function updateSaveTotals(ctx, next) {
  const Drink = ctx.Model;
  if (!ctx.instance) {
    return next();
  }
  const { playerId, player, brandId, brand } = ctx.instance;
  if(!playerId){
    next('Can not calculate total, player id is undefined');
  }
  if(!brandId){
    next('Can not calculate total, brand id is undefined');
  }
  const PLAYER_DRINK_SEARCH = generateDrinkSearch({ playerId });
  const BRANDS_DRINK_SEARCH = generateDrinkSearch({ brandId });
  Promise.all([
    Drink.find(PLAYER_DRINK_SEARCH).then(calculateTotal(player)),
    Drink.find(BRANDS_DRINK_SEARCH).then(calculateTotal(brand))
  ])
  .then(()=> updateAllPositions(ctx))
  .then(() => next()).catch(next);
}

function updateAllPositions(ctx){
  const Player = ctx.Model.app.models.Player;
  const Brand = ctx.Model.app.models.Brand;
  return Promise.all([
    updatePositions(Player),
    updatePositions(Brand)
  ]);
}
