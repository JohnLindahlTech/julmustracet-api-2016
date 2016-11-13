module.exports = function updatePositions(Model){
  return Model.find({order:'total DESC'}).then((items) => {
    return Promise.all(
      items.map((item, position) =>{
        if(item.position === position + 1){
          return Promise.resolve(item);
        } else {
          item.position = position + 1;
          return item.save();
        }
      })
    )
  })
}
