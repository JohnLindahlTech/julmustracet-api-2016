const app = require('../../server/server');

const {
  startDate,
  endDate,
  minAmount,
  maxAmount,
} = app.get('rules');
const start = new Date(startDate);
const end = new Date(endDate);


function touchInstance(instance) {
  if (instance) {
    instance.touched = new Date();  // eslint-disable-line no-param-reassign
    return instance.save();
  }
  return Promise.resolve(true);
}

function customValidate(evalFn) {
  return function evaluateComparison(err) {
    if (evalFn(this)) err();
  };
}

function amountLessThanMin(drink) {
  return drink.amount < minAmount;
}

function amountMoreThanMax(drink) {
  return drink.amount > maxAmount;
}

function dateLessThanStart(drink) {
  if (!drink.date) {
    return false;
  }
  return drink.date.getTime() < start.getTime();
}

function getEarliestDate(...dates) {
  return new Date(Math.min.apply(null, dates));
}

function dateMoreThanEndOrCurrent(drink) {
  if (!drink.date) {
    return false;
  }
  const maxDate = getEarliestDate(new Date(), end);
  return drink.date.getTime() > maxDate.getTime();
}

function pokeRelations(ctx, next) {
  if (ctx.instance) {
    const { player, brand } = ctx.instance;
    return Promise.all([
      player.getAsync().then(touchInstance),
      brand.getAsync().then(touchInstance),
    ]);
  }
  return next();
}

function storeAwayData(ctx) {
  return ctx.Model.find({ where: ctx.where })
  .then(drinks => drinks.map(drink => Promise.all([
    drink.player.getAsync(),
    drink.brand.getAsync(),
  ])))
  .then((items) => {
    ctx.hookState.items = items; // eslint-disable-line no-param-reassign
    return items;
  });
}

function updatePlayersAndBrands(ctx) {
  return Promise.all(ctx.hookState.items)
  .then(items =>
     items.map(([player, brand]) =>
      Promise.all([
        touchInstance(player),
        touchInstance(brand),
      ])));
}

module.exports = (Drink) => {
  Drink.disableRemoteMethod('upsert', true);
  Drink.disableRemoteMethod('updateAll', true);

  Drink.disableRemoteMethod('replaceById', false);
  Drink.disableRemoteMethod('replaceOrCreate', true);
  Drink.disableRemoteMethod('upsertWithWhere', true);
  Drink.disableRemoteMethod('createChangeStream', true);
  Drink.disableRemoteMethod('__get__player', false);
  Drink.disableRemoteMethod('__get__brand', false);

  Drink.observe('before delete', storeAwayData);
  Drink.observe('after delete', updatePlayersAndBrands);

  Drink.observe('after save', pokeRelations);

  Drink.once('attached', () => {
    const { Brand } = Drink.app.models;
    const origCreate = Drink.create.bind(Drink);

    function create(rawDrink, options, done) {
      if (!rawDrink.brandId && rawDrink.brand) {
        return Brand.find({ where: { name: rawDrink.brand }, limit: 1 })
          .then(([brand]) => {
            if (brand) {
              return brand;
            }
            return Brand.create({ name: rawDrink.brand });
          })
          .then(brand => Object.assign({}, rawDrink, { brandId: brand.id }))
          .then(drink => origCreate(drink, options, done))
          .catch(done);
      }
      return origCreate(rawDrink, options, done);
    }

    Object.assign(Drink, { create });
  });

  Drink.validatesPresenceOf('brandId', 'playerId', 'date');
  Drink.validatesLengthOf('brand', { max: 100, min: 1 });
  Drink.validatesNumericalityOf('amount');
  Drink.validate('amount', customValidate(amountLessThanMin));
  Drink.validate('amount', customValidate(amountMoreThanMax));
  Drink.validate('date', customValidate(dateLessThanStart));
  Drink.validate('date', customValidate(dateMoreThanEndOrCurrent));
};
