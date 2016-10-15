'use strict';

const ADMIN = 'admin';

module.exports = function(app, callback) {
  const Player = app.models.Player;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;

  const defaultPlayer = require('../../config/admin.json');
  const searchPlayerTerm = {where: {email: defaultPlayer.email}, limit: 1};
  const searchRoleTerm = {where: {name: ADMIN}, limit: 1};
  const getSearchPrincipalRoleTerm = (player, role) => ({ where: {and: { roleId: role.id, principalId: player.id} }, limit: 1});

  console.log('Init Admin Creation.');

  return Promise.all([
    Player.find(searchPlayerTerm),
    Role.find(searchRoleTerm)
  ]).then(([players, roles]) =>{
    if(!roles.length){
      throw new Error('No Admin Role, Please fix');
    }
    if(players.length){
      console.info('Default admin already exists.');
      return players[0];
    }
    return Player.create(defaultPlayer)
      .then(admin => ({ admin, role: roles[0] }))
      .then(({admin, role}) =>{
        return role.principals.create({
          principalType: RoleMapping.USER,
          principalId: admin.id,
        }).then(() => admin);
      });
  })
  .then(admin => {
    console.log('Admin Ready: ', admin.username);
  })
  .catch(console.error.bind(console))
  .then(() => callback());
};

function promisify(fn){
  return new Promise((resolve, reject) => {
    fn((err, data) => {
      if(err) reject(err);
      resolve(data);
    });
  });
}
