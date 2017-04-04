const Thinodium = require('thinodium')

const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('promise')



// keep track of connections
const _connections = {}



/**
 * Create a database connection.
 *
 * @param {Object} id Database id.
 * @param {Object} logger The app logger
 * @param {Object} dbConfig configuration
 * @param {String} dbConfig.poolConfig connection pool config
 * @param {String} dbConfig.name db name
 *
 * @return {Object} db connection.
 */
exports.create = function *(id, logger, dbConfig) {
  logger.info('Connecting to RethinkDB', id)

  const db = yield Thinodium.connect('rethinkdb', dbConfig.serverConfig)

  _connections[id] = db

  return db
}




/**
 * Shutdown all database connections.
 *
 * @param {Object} logger The app logger
 */
exports.closeAll = function *(logger) {
  logger.info('Close all connections')

  yield _.map(_connections, (db) => {
    return Q.try(() => {
      if (db.isConnected) {
        return db.disconnect()
      }
    })
  })
}