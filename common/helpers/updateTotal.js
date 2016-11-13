function calculateTotal(drinks) {
  return drinks.reduce((result, { amount }) => (result + amount), 0);
}

function asyncCalcTotal(reference) {
  return reference.drinks.getAsync()
    .then(calculateTotal);
}

function update(ctx, instance) {
  return (total) => {
    if (instance.total === total) {
      Object.assign(ctx.hookState, { totalUntouched: true });
      return instance;
    }
    return Object.assign(instance, { total });
  };
}

module.exports = function updateTotal(ctx) {
  if (ctx.instance) {
    return asyncCalcTotal(ctx.instance)
    .then(update(ctx, ctx.instance));
  }
  return asyncCalcTotal(ctx.currentInstance)
    .then(update(ctx, ctx.data));
};
