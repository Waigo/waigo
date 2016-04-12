"use strict";

const co = require('co');

const waigo = global.waigo,
  _ = waigo._;



/**
 * Setup activity recorder for the app.
 *
 * This allows you to record activities to the `Activities` model.
 * 
 * This should be preceded by startup: `models`.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Setting up Activity recording');

  app.actions.on('record', co(function*() {
    yield app.models.Activity.record.apply(app.models.Activity, arguments);
  }));
};

