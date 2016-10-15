'use strict';

const ADMIN = 'admin';

module.exports = function(app) {
  const Player = app.models.Player;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;
  const Drink = app.models.Drink;

  const defaultPlayer = require('../../config/admin.json');
  const searchPlayerTerm = {where: {email: defaultPlayer.email}, limit: 1};
  const searchRoleTerm = {where: {name: ADMIN}, limit: 1};
  const getSearchPrincipalRoleTerm = (player, role) => ({ where: {and: { roleId: role.id, principalId: player.id} }, limit: 1});
  Player.find(searchPlayerTerm)
    .then(players => {
      if(players.length){
        console.info('Default Players already exists.');
        return players[0];
      }
      return Player.create(defaultPlayer)
    }).then(player => {
      return Role.find(searchRoleTerm)
        .then(roles => {
          if (roles.length){
            console.info('Role already exists');
            return roles[0];
          }
          return Role.create({name: ADMIN});
        }).then(role => {
            return promisify(role.principals)
            .then(principals => {
              if(principals.length){
                console.info('Principal already exists');
                return principals;
              }
              return role.principals.create({
                principalType: RoleMapping.USER,
                principalId: player.id,
              });
            });
        });
    })
    .then(()=> console.info('Admin ready.'))
    .catch(console.error.bind(console));
};

function promisify(fn){
  return new Promise((resolve, reject) => {
    fn((err, data) => {
      if(err) reject(err);
      resolve(data);
    });
  });
}
