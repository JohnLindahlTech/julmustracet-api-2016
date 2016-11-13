module.exports = function calculateTotal(drinks) {
  return drinks.reduce((result, { amount }) => (result + amount), 0);
};
