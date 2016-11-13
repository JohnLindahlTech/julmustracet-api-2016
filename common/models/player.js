const { whiteListPlayer, updateTotal, updatePositions, calculateDaily } = require('../helpers');

const USER = 'user';

function connectPlayerToRole(ctx, next) {
  const Role = ctx.Model.app.models.Role;
  const RoleMapping = ctx.Model.app.models.RoleMapping;

  if (typeof ctx.isNewInstance === 'boolean' && ctx.isNewInstance) {
    return Role.find({ where: { name: USER }, limit: 1 })
    .then(([userRole]) =>
      userRole.principals.create({
        principalType: RoleMapping.USER,
        principalId: ctx.instance.id,
      }))
    .then(() => next())
    .catch(next);
  }
  return next();
}

module.exports = (Player) => {
  function attachRoleToLogin(ctx, instance, next) {
    // TODO Working code but it just wont expose the data in the actual REST-response.
    const Role = Player.app.models.Role;
    const RoleMapping = Player.app.models.RoleMapping;
    return RoleMapping.find({
      fields: { roleId: true },
      where: {
        and: [
          { principalType: RoleMapping.USER },
          { principalId: instance.userId },
        ],
      },
    })
    .then(maps =>
      Role.find({
        fields: { name: true, id: true },
        where: { or: maps.map(({ roleId }) => ({ id: roleId })) },
      })
      .then((roles) => {
        instance.roles = roles; // eslint-disable-line no-param-reassign
      }))
    .then(() => next());
  }

  Player.disableRemoteMethod('upsert', true);
  Player.disableRemoteMethod('updateAll', true);

  Player.disableRemoteMethod('__count__accessTokens', false);
  Player.disableRemoteMethod('__create__accessTokens', false);
  Player.disableRemoteMethod('__delete__accessTokens', false);
  Player.disableRemoteMethod('__destroyById__accessTokens', false);
  Player.disableRemoteMethod('__findById__accessTokens', false);
  Player.disableRemoteMethod('__get__accessTokens', false);
  Player.disableRemoteMethod('__updateById__accessTokens', false);

  Player.disableRemoteMethod('createChangeStream', true);
  Player.disableRemoteMethod('replaceOrCreate', true);
  Player.disableRemoteMethod('upsertWithWhere', true);

  Player.observe('after save', connectPlayerToRole);
  Player.afterRemote('**', whiteListPlayer);
  Player.afterRemote('login', attachRoleToLogin);


  Player.validatesLengthOf('username', { max: 100 });
  Player.validatesLengthOf('email', { max: 100 });
  // Player.validatesLengthOf('password', {min: 6}); // TODO It seems like it is not possible to check length of password. https://github.com/strongloop/loopback/issues/251

  Player.observe('before save', ctx => updateTotal(ctx));
  Player.observe('after save', updatePositions);

  Player.afterRemote('find', calculateDaily);
  Player.afterRemote('findOne', calculateDaily);
  Player.afterRemote('findById', calculateDaily);
};
