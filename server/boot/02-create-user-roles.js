'use strict';

const ADMIN = 'admin';
const USER = 'user';

module.exports = function(app, callback) {
  const Role = app.models.Role;

  const searchAdmin = {where: {name: ADMIN}, limit: 1};
  const searchUser = {where: {name: USER}, limit: 1};
  console.log('Init Roles Creation.');
  return Role.find(searchAdmin).then(conditionallyCreateRole(Role, { name: ADMIN }))
  .then(admin => {
    return Role.find(searchUser).then(conditionallyCreateRole(Role, { name: USER }));
  })
  .catch(console.error.bind(console)).
  then(() => callback());


  function conditionallyCreateRole(model, data) {
    return (instances) => {
      if (instances.length) {
        console.log('Already exists:', instances[0].name);
        return instances[0];
      }
      console.log('Creating Role:', data.name);
      return model.create(data);
    }
  }
};
