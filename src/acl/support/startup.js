const waigo = global.waigo



/**
 * Setup ACL.
 *
 * @param {Object} app The application.
 */
module.exports = function *(App) {
  App.acl = yield (waigo.load('acl')).init(App)
}
