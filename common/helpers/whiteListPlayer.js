const WHITE_LIST_FIELDS = ['total', 'id', 'username', 'daily', 'position'];

function mapResult(result) {
  return WHITE_LIST_FIELDS
  .reduce((replacement, field) => Object.assign(replacement, { [field]: result[field] }), {});
}

function isLoggedInUser(ctx) {
  return ctx.req.accessToken && ctx.req.accessToken.userId.equals(ctx.result.id);
}

module.exports = function whiteListData(ctx, modelInstance, next) {
  if (!ctx.result || isLoggedInUser(ctx)) {
    return next();
  }

  if (Array.isArray(modelInstance)) {
    ctx.result = ctx.result.map(mapResult); // eslint-disable-line no-param-reassign
  } else {
    ctx.result = mapResult(ctx.result); // eslint-disable-line no-param-reassign
  }
  return next();
};
