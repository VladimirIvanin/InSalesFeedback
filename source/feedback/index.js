var defaults = require('../variables').defaults;
var binding = require('./binding');
var eventMachine = require('./eventMachine');
var sendMessage = require('./sendMessage');
var errorRender = require('./render').errorRender;
var successRender = require('./render').successRender;
var checkDuplicateId = require('./validate').checkDuplicateId;
var checkProduct = require('./validate').checkProduct;
var checkNameContent = require('./validate').checkNameContent;
var validateFormData = require('./validate').validateFormData;

var Feedback = function ($elem, options) {
  var self = this;

  self.$element = $($elem);

  self.options = $.extend(true, {}, defaults, options);

  self.initBinding = binding;
  self.sendMessage = sendMessage;
  self.eventMachine = eventMachine;
  self.validateFormData = validateFormData;
  self.errorRender = errorRender;
  self.successRender = successRender;

  self.initFeedback();

  return self;
};

Feedback.prototype.initFeedback = function ($elem, options) {
  var self = this;

  self.isPageProduct = checkProduct();
  checkDuplicateId(self.$element);
  self.initBinding();

  if (!self.options.useDefaultContent) {
    checkNameContent(self.$element);
  }

  return;
};

module.exports = Feedback;
