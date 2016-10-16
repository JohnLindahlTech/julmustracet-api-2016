const WHITE_LIST_FIELDS = ['total', 'id', 'username', 'daily'];

module.exports = function whiteListData(ctx, modelInstance, next) {
  if(!ctx.result || isLoggedInUser(ctx)){
    return next();
  }

  if (Array.isArray(modelInstance)) {
    ctx.result = ctx.result.map(mapResult);
  } else {
    ctx.result = mapResult(ctx.result);
  }
  next();
}

function isLoggedInUser(ctx){
  return ctx.req.accessToken && ctx.req.accessToken.userId.equals(ctx.result.id);
}

function mapResult(result){
  return WHITE_LIST_FIELDS.reduce((replacement, field) => {
    replacement[field] = result[field];
    return replacement;
  }, {});
}
