/**
 * Base configuration
 */


/**
 * Server listening port.
 * @type {Number}
 */
exports.port = 3000;


/**
 * Base web URL
 * @type {String}
 */
exports.baseURL = 'http://localhost:' + exports.port;


/**
 * Db connection
 * @type {Object}
 */
exports.db = {
  mongoose: {
    host: '127.0.0.1',
    port: '27017',
    db: 'waigo'
  }
};


/**
 * Logging config.
 * @type {Object}
 */
exports.logging = {
  winston: {
    mongo: {
      level: 'error',
      collection: 'logs',
      safe: false
    }
  }
};


/**
 * Session config.
 *
 * We don't provide a default 'secret' so as to encourage developers to provide a custom one for their app.
 *
 * @type {String}
 */
exports.session = {
  secret: null,  // This should be provided by apps
  store: {
    type: 'mongo',
    config: {
      url: 'mongodb://127.0.0.1:27017/sessions',
      collection: 'sessions'
    }
  },
  cookie: {
    validForDays: 7,
    path: '/'
  }
};


/**
 * View formats.
 * @type {Object}
 */
exports.viewFormats = {
  /** List of enabled formats along with options to pass to each formatter. */
  formats: {
    html: {
      folder: 'views',
      ext: 'jade'
    },
    json: {}
  },
  /** Use this URL query parameter to determine output format. */
  paramName: 'format',
  /** Default format, in case URL query parameter which determines output format isn't provided. */
  default: 'html'
};



/**
 * Static resources (relative to app root folder).
 * @type {String}
 */
exports.staticFolder = '../public';


/**
 * Single-file upload size limit (MB).
 * @type {Number}
 */
exports.uploadLimitMb = 10;


/**
 * Name of access control model.
 * @type {String}
 */
exports.accessControlModel = 'Account';


/**
 * Config for error handler.
 * @type {Object}
 */
exports.errorHandlerConfig = {
  showStack: false
};
