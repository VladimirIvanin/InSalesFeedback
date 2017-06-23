/* global $ */
var defaults = require('variables').defaults;

var Factory = function ($elem, options) {
  var self = this;
  
  self.options = $.extend(true, {}, defaults, options);

  return self;
};

module.exports = Factory;
