'use strict';

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  server.use(server.loopback.token({
    model: server.models.accessToken,
    currentUserLiteral: 'me',
  }));
  server.use(router);
};
