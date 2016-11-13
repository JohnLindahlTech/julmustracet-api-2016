module.exports = function updatePositions(ctx) {
  if (ctx.hookState.totalUntouched) {
    return Promise.resolve(true);
  }
  return ctx.Model.find({ order: 'total DESC' }).then(items => Promise.all(
      items.map((item, position) => {
        if (item.position === position + 1) {
          return Promise.resolve(item);
        }
        Object.assign(item, { position: position + 1 });
        return item.save();
      })));
};
