const app = require('../../server/server');

function treatAsUTC(date) {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
  return result;
}

function daysBetween(startDate, endDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

function calculateDailyInternal(instance) {
  const now = Date.now();
  const { startDate } = app.get('rules');
  const start = new Date(startDate);

  const days = daysBetween(start, now);
  const daily = instance.total / days;
  return Object.assign(instance, { daily });
}

module.exports = function calculateDaily(ctx, model, next) {
  if (Array.isArray(ctx.result)) {
    ctx.result.map(calculateDailyInternal);
  } else {
    Object.assign(ctx.result, calculateDailyInternal(ctx.result));
  }
  next();
};
