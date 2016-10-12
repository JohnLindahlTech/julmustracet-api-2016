'use strict';
module.exports = function(app) {
  const Brand = app.models.Brand;
  const defaultBrands = [
    { name: 'Harboe' },
    { name: 'Nygårda' },
    { name: 'ICA' },
    { name: 'Coop' },
    { name: 'Apotekarnes' },
    { name: 'Zeunerts' },
    { name: 'Guttsta källa' },
    { name: 'Three hearts' },
    { name: 'Nygårdas Ekfatslagrade' },
    { name: 'Wasa' },
  ];
  const brandSearchTerm = {};
  return Brand.find()
  .then(brands => {
    if(brands.length >= defaultBrands.length){
      console.info('Brands already exists');
      return brands;
    }
    return Brand.create(defaultBrands);
  })
  .then(() => console.info('Brands ready.'))
  .catch(console.error.bind(console));
};
