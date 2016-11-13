module.exports = function updatePositions(Model) {
  return Model.find({ order: 'total DESC' }).then(items => Promise.all(
      items.map((item, position) => {
        if (item.position === position + 1) {
          return Promise.resolve(item);
        }
        item.position = position + 1; // eslint-disable-line no-param-reassign
        return item.save();
      })));
};
