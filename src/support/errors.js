/**
 * Exceptions and error handlers.
 */

var _ = require('lodash'),
  Promise = require('bluebird'),
  util = require('util');


/**
 * Convert given error to view object.
 *
 * @param error {Error} error object.
 *
 * @return {Promise}
 */
var errorToViewObject = exports.toViewObject = function(error) {
  if (_.isFunction(error.toViewObject)) {
    return Promise.resolve(error.toViewObject());
  } else {
    return Promise.resolve({
      msg: error.message
    });
  }
};





/**
 * Base error class.
 *
 * @param msg {String} error message.
 * @param status {Number} HTTP return status code to set.
 */
var BaseError = exports.BaseError = function(msg, status) {
  Error.call(this, this.message);
  this.name = 'BaseError';
  this.message = msg || 'An error occurred';
  this.status = status || 500;
  Error.captureStackTrace(this, BaseError);
};
util.inherits(BaseError, Error);
/**
 * Get renderable representation of this error.
 *
 * @return {Promise}
 */
BaseError.prototype.toViewObject = function() {
  return Promise.resolve({
    type: this.name,
    msg: this.message
  });
};
/**
 * Create a subclass of this error type.
 *
 * @param subTypeErrorName {String} name of this new error type.
 * @param options {Object} additional options.
 * @param options.message {Object} default error message.
 * @param options.status {Object} default error status.
 *
 * @return {Function} the subtype class.
 */
BaseError.createSubType = function(subTypeErrorName, options) {
  options = options || {};

  var newErrorClass = function(msg, status) {
    BaseError.call(this, msg || options.message, status || options.status);
    this.name = subTypeErrorName;
    Error.captureStackTrace(this, newErrorClass);
  };
  util.inherits(newErrorClass, BaseError);
  return newErrorClass;
};




/**
 * Multiple errors grouped together.
 *
 * @param errors {Object} key-value map of errors, where each value is itself an `Error` instance.
 * @param status {Number} HTTP return status code to set.
 */
var MultipleError = exports.MultipleError = function(errors, status) {
  BaseError.call(this, 'There were multiple errors', status);
  this.name = 'MultipleError';
  this.errors = errors || {};
  Error.captureStackTrace(this, MultipleError);
};
util.inherits(MultipleError, BaseError);
/**
 * @see BaseError#toViewObject
 */
MultipleError.prototype.toViewObject = function() {
  var self = this;

  return Promise.props(
      _.mapValues(self.errors, function(err) {
        return errorToViewObject(err);
      })
    )
    .then(function gotViewObjects(viewObjects) {
      return {
        type: self.name,
        errors: viewObjects
      };
    });
};








