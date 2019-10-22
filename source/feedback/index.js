var defaults = require('../variables').defaults;
var binding = require('./binding');
var eventMachine = require('./eventMachine');
var sendMessage = require('./sendMessage');
var errorRender = require('./render').errorRender;
var successRender = require('./render').successRender;
var checkProduct = require('./validate').checkProduct;
var checkNameContent = require('./validate').checkNameContent;
var validateFormData = require('./validate').validateFormData;
var generateUUID = require('./helpers').generateUUID;

var Feedback = function ($elem, options) {
  var self = this;

  self.$element = $($elem);

  var _UUID = generateUUID();
  self.UUID = _UUID;
  self.$element[0].InSalesFeedbackUUID = _UUID;


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
  self.initBinding();

  if (!self.options.useDefaultContent) {
    checkNameContent(self.$element);
  }
};

module.exports = Feedback;
