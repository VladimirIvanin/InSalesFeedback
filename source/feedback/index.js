var defaults = require('../variables').defaults;
var binding = require('./binding');
var eventMachine = require('./eventMachine');
var sendMessage = require('./sendMessage');
var checkDuplicateId = require('./validate').checkDuplicateId;
var validateFormData = require('./validate').validateFormData;

var Feedback = function ($elem, options) {
  var self = this;

  self.$element = $($elem);

  self.options = $.extend(true, {}, defaults, options);

  self.initBinding = binding;
  self.sendMessage = sendMessage;
  self.eventMachine = eventMachine;
  self.validateFormData = validateFormData;

  self.initFeedback();

  return self;
};

Feedback.prototype.initFeedback = function ($elem, options) {
  var self = this;

  checkDuplicateId(self.$element);
  self.initBinding();

  return;
};

module.exports = Feedback;
