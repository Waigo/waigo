"use strict";


var _ = require('lodash');



/**
 * The name of the method which when called will return a view object representation of the callee.
 * @type {String}
 */
var methodName = exports.methodName = 'toViewObject';




/**
 * Get yieldable for converting given object into a view object.
 *
 * @param {Object} ctx A request context.
 * @param  {*} inputObject The object.
 * @return A yieldable value.
 */
var toViewObjectYieldable = exports.toViewObjectYieldable = function(ctx, inputObject) {
  if (inputObject) {
    // has view object method
    if (inputObject[methodName]) {
      return inputObject[methodName].call(inputObject, ctx);
    } 
    // is an array
    else if (_.isArray(inputObject)) {
      // recursive call on all children
      return inputObject.map(function(local) {
        return toViewObjectYieldable(ctx, local);
      });
    }
    // is an object
    else if (_.isPlainObject(inputObject)) {
      var yieldables = {};

      for (let idx in inputObject) {
        yieldables[idx] = toViewObjectYieldable(ctx, inputObject[idx]);
      }

      return yieldables;
    }
  }

  return inputObject;
};


