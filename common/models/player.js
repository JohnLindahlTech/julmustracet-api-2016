'use strict';
const whiteListPlayer = require('../helpers/whiteListPlayer');
const USER = 'user';
module.exports = function(Player) {
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
  Player.afterRemote('login', attachRole);

  function attachRole(ctx, instance, next){
    // TODO Working code but it just wont expose the data in the actual REST-response.
    const Role = Player.app.models.Role;
    const RoleMapping = Player.app.models.RoleMapping;
    RoleMapping.find({
      fields: {roleId:true},
      where: {
        and:[
          { principalType: RoleMapping.USER },
          { principalId: instance.userId }
        ]
      }
    })
    .then(maps => {
      return Role.find({fields:{name:true, id:true}, where: {or: maps.map(({roleId}) => ({id:roleId}))}}).then(roles => {
        instance.roles = roles;
      });
    })
    .then(() => next())
  }
};

function connectPlayerToRole(ctx, next){
  const Role = ctx.Model.app.models.Role;
  const RoleMapping = ctx.Model.app.models.RoleMapping;

  if(typeof ctx.isNewInstance === 'boolean' && ctx.isNewInstance){
    return Role.find({ where: { name: USER }, limit: 1 }).then(([userRole]) => {
      return userRole.principals.create({
        principalType: RoleMapping.USER,
        principalId: ctx.instance.id,
      });
    })
    .then(()=>next())
    .catch(next);
  }
  next();
}
