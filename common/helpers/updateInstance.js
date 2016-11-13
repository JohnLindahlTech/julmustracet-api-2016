function calculateTotal(drinks) {
  return drinks.reduce((result, { amount }) => (result + amount), 0);
}

function updateTotal(instance, reference) {
  return reference.drinks.getAsync()
  .then(calculateTotal)
  .then((total) => {
    instance.total = total; // eslint-disable-line no-param-reassign
  });
}

module.exports = function updateInstance(ctx) {
  console.log('Updating instance', ctx.instance, ctx.currentInstance);
  if (ctx.instance) {
    return updateTotal(ctx.instance, ctx.instance);
  }
  return updateTotal(ctx.data, ctx.currentInstance);
};
