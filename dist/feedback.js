(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var parseSerialize = require('./helpers').parseSerialize;
var system = require('../variables').system;

function binding() {
  var self = this;
  var $form = self.$element;

  $form.on('submit', function(event) {
    event.preventDefault();

    var dataForm = parseSerialize($form.serialize());
    var customValidate = self.options.customValidate;

    if (customValidate && typeof customValidate == 'function') {

      var isDone = customValidate($form, dataForm);
      if (isDone) {
        self.sendMessage(dataForm).done(function (onDone) {
          self.eventMachine('success', $form, onDone);
        })
        .fail(function (onFail) {
          self.eventMachine('fail', $form, onFail);
        });
      }else{
        self.eventMachine('error', $form, dataForm);
      }

    }
    else{
      self.validateFormData(dataForm).done(function (updateFormData) {
        self.sendMessage(updateFormData).done(function (onDone) {
          self.eventMachine('success', $form, onDone);
        })
        .fail(function (onFail) {
          self.eventMachine('fail', $form, onFail);
        });
      })
      .fail(function (onErrorData) {
        self.errorRender(onErrorData);
        self.eventMachine('error', $form, onErrorData);
      });

    }
  });

  $(document).on(system.events.success, function(event) {
    if (self.options.resetFormOnSubmit) {
      if ($form.get(0)) {
        $form.get(0).reset();
      }
    }
    self.successRender();
  });
}

module.exports = binding;
},{"../variables":10,"./helpers":3}],2:[function(require,module,exports){
var system = require('../variables').system;

function eventMachine(name, $target, data) {
  var self = this;
  var _method = getMethodName(name);
  var _event = getEventName(name);
  var _data = data || {};
  _data.$target = $target;

  if (typeof EventBus == 'object' && EventBus.publish) {
    EventBus.publish(_event, _data)
  }

  var event = jQuery.Event( _event );
  event['InSalesFeedback'] = _data;

  $(document).trigger( event );

  if (self.options[_method] && typeof self.options[_method] == 'function') {
    self.options[_method](_data)
  }
}

function getEventName(name) {
  return system.events[name];
}
function getMethodName(name) {
  return 'on' + capitalize(name);
}

var capitalize = function(_string) {
    return _string.charAt(0).toUpperCase() + _string.slice(1);
}

module.exports = eventMachine;
},{"../variables":10}],3:[function(require,module,exports){
function parseSerialize(string) {
  if (string == "") {
    return {};
  }
  var _data = {};
  var decodeString = decodeURI(string);
  var search = decodeString.replace( '?', '' ).split( '&' );
  var VRegExp = new RegExp(/(([A-Za-z0-9])+)+/g);
  $.each( search, function( index, part ){
    if( part !== '' ){
      part = part.split( '=' );
      if (part[0].indexOf('[]') > -1) {
        var VResult = part[0].match(VRegExp);
        var _key = VResult[0];
        if (!_data[ _key ]) {
          _data[ _key ] = [];
        }
        _data[ _key ].push(part[ 1 ]);
      }else{
        if (part[0].indexOf('[') > -1) {
          var _key = part[0];
          var VResult = part[0].match(VRegExp);
          if (!_data[ VResult[0] ]) {
            _data[ VResult[0] ] = [];
          }
          if (!_data[ VResult[0] ][VResult[1]]) {
            _data[ VResult[0] ][VResult[1]] = [];
          }
          var _part = decodeURIComponent(part[ 1 ]);
          if (_part === 'undefined') {
            _part = '';
          }
          _data[ VResult[0] ][VResult[1]].push(_part);
        }else{
          var _part = decodeURIComponent(part[ 1 ]);
          if (_part === 'undefined') {
            _part = '';
          }
          _data[ part[ 0 ] ] = _part;
        }
      }

    }
  });
  return _data;
}

function getPageLink() {
  var url = window.location.href;
  var title = $('title').text();
  return '<a href="'+url+'">' + title + '</a>';
}

function testRequire(name, _require) {
  return _require.indexOf(name) > -1;
}

function getPhoneNumberLength(phone) {
  if (!phone) {
    phone = '';
  }else{
    phone = decodeURIComponent(phone);
  }

  var VRegExp = new RegExp(/[\d]/g);
  var VResult = phone.match(VRegExp);
  if (!VResult) {
    VResult = [];
  }

  return VResult.length;
}

function getDataAttrName(name, value) {
  var resultName = (value) ? name + '="'+value+'"' : name;

  return '[' + resultName + ']';
}

module.exports = {
  'parseSerialize': parseSerialize,
  'testRequire': testRequire,
  'getPhoneNumberLength': getPhoneNumberLength,
  'getDataAttrName': getDataAttrName,
  'getPageLink': getPageLink
}
},{}],4:[function(require,module,exports){
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
},{"../variables":10,"./binding":1,"./eventMachine":2,"./render":5,"./sendMessage":6,"./validate":8}],5:[function(require,module,exports){
var getDataAttrName = require('./helpers').getDataAttrName;
var system = require('../variables').system;

function errorRender(errors) {
  var self = this;
  var useJqueryToggle = self.options.useJqueryToggle;
  var fieldSelector = getDataAttrName(self.options.selectors.field) + ':first';
  var inputErrorSelector = getDataAttrName(self.options.selectors.inputError);
  var errorSelector = getDataAttrName(self.options.selectors.error);
  var errorsSelector = getDataAttrName(self.options.selectors.errors);
  var errorClass = self.options.classes.errorInput;
  var errorClassField = self.options.classes.errorField;

  $.each(errors, function(index, el) {
    var $input = self.$element.find('[name="'+el.name+'"]');
    var $field = $input.parents( fieldSelector );
    var $inputErrorSelector = $field.find( inputErrorSelector );
    $input.addClass(errorClass);
    $field.addClass(errorClassField);

    renderWithOptions($inputErrorSelector, el.errorMessage, '', true, useJqueryToggle);

    if (self.options.hideErrorOnFocus) {
      $input.on('click', function(event) {
        removeErrors($input, $field, $inputErrorSelector);
      });
    }

  });

  function removeErrors($input, $field, $inputErrorSelector) {
    $input.removeClass(errorClass);
    $field.removeClass(errorClassField);

    renderWithOptions($inputErrorSelector, '', '', false, useJqueryToggle);
    renderWithOptions(self.$element.find(errorSelector), '', '', false, useJqueryToggle);
    renderWithOptions(self.$element.find(errorsSelector), '', '', false, useJqueryToggle);
  }

  var errorsNames = [];

  $.each(errors, function(index, err) {
    errorsNames.push(err.name);
  });

  $.each(system.names, function(index, system_name) {
    if (errorsNames.indexOf(system_name) == -1) {
      var $input = self.$element.find('[name="'+system_name+'"]');
      var $field = $input.parents( fieldSelector );
      var $inputErrorSelector = $field.find( inputErrorSelector );
      removeErrors($input, $field, $inputErrorSelector)
    }
  });

  if (errors && errors.length) {
    self.$element.addClass(self.options.classes.errorForm);

    renderWithOptions(self.$element.find(errorSelector), self.options.messages.error, '', true, useJqueryToggle);

    var _errorsContent = '';
    _.forEach(errors, function (err) {
      _errorsContent += err.errorMessage + '<br />'
    });
    renderWithOptions(self.$element.find(errorsSelector), _errorsContent, '', true, useJqueryToggle);
  }
}

function successRender() {
  var self = this;
  var $form = self.$element;
  var useJqueryToggle = self.options.useJqueryToggle;
  var hideSuccessMessageTimer = self.options.hideSuccessMessageTimer;
  var errorClass = self.options.classes.errorInput;
  var errorClassField = self.options.classes.errorField;

  var fieldSelector = getDataAttrName(self.options.selectors.field);
  var inputErrorSelector = getDataAttrName(self.options.selectors.inputError);
  var errorSelector = getDataAttrName(self.options.selectors.error);
  var errorsSelector = getDataAttrName(self.options.selectors.errors);
  var successSelector = getDataAttrName(self.options.selectors.success);

  self.$element.find('[name]').removeClass(errorClass);
  self.$element.find(fieldSelector).removeClass(errorClassField);
  self.$element.removeClass(self.options.classes.errorForm);

  var $errorSelector = $form.find(errorSelector);
  renderWithOptions($errorSelector, '', '', false, useJqueryToggle);

  var $errorsSelector = $form.find(errorsSelector);
  renderWithOptions($errorsSelector, '', '', false, useJqueryToggle);

  var $inputErrorSelector = $form.find(inputErrorSelector);
  renderWithOptions($inputErrorSelector, '', '', false, useJqueryToggle);

  var $success = $form.find(successSelector);
  renderWithOptions($success, self.options.messages.success, '', true, useJqueryToggle, hideSuccessMessageTimer);
}

function renderWithOptions($selector, message, activeClass, isActive, useJqueryToggle, hideSuccessMessageTimer) {
  if (message) {
    $selector.html(message);
  }
  if (isActive) {
    $selector.addClass(activeClass);
  }
  else {
    $selector.removeClass(activeClass);
  }

  if (useJqueryToggle) {
    if (isActive) {
      $selector.show();
    }
    else {
      $selector.hide();
    }
  }

  if (hideSuccessMessageTimer) {
    setTimeout(function () {
      $selector.removeClass(activeClass);
      $selector.html('');
      if (useJqueryToggle) {
        $selector.hide();
      }
    }, hideSuccessMessageTimer)
  }
}

module.exports = {
  'errorRender': errorRender,
  'successRender': successRender
};
},{"../variables":10,"./helpers":3}],6:[function(require,module,exports){
var parseSerialize = require('./helpers').parseSerialize;

function sendMessage(dataForm) {
  var self = this;
  var result = $.Deferred();
  var search = parseSerialize(window.location.search);
  var _lang = search.lang || '';
  var _message = {
    lang: _lang,
    feedback: dataForm,
  };

  $.post('/client_account/feedback.json', _message)
    .done(function (response) {
      if (_message && response.status == 'ok') {
        result.resolve(response);
      }
      else {
        response.message = _message;
        result.reject(response);
      }
    });

  return result.promise();
}

module.exports = sendMessage;
},{"./helpers":3}],7:[function(require,module,exports){
var getPageLink = require('./helpers').getPageLink;

function updateContentData(owner, formContent, isError) {
  var result = $.Deferred();
  var content = formContent || '';

  content = getCustomContent(owner, content);
  content = getContentHtml(owner, content);

  if (owner.isPageProduct && owner.options.includeProductInfo && !isError) {
    $.ajax({
      url: window.location.pathname + '.json',
      type: 'GET',
      dataType: 'json'
    })
    .done(function(success) {
      if (success && success.product) {
        if (owner.options.messageContent) {
          content = updateContentTop(content, owner.options.messageContent);
        }
        content = getProductInfo(success.product, content);
        if (owner.options.urlPageOnContent) {
          content = updateContentFooter(content);
        }
        result.resolve(content);
      }else{
        if (owner.options.urlPageOnContent) {
          content = updateContentFooter(content);
        }
        result.resolve(content);
      }
    })
    .fail(function() {
      if (owner.options.urlPageOnContent) {
        content = updateContentFooter(content);
      }
      result.resolve(content);
    })

  }else{
    if (owner.options.urlPageOnContent) {
      content = updateContentFooter(content);
    }
  }

  if (!owner.isPageProduct || !owner.options.includeProductInfo || isError) {
    result.resolve(content);
  }

  return result.promise();
}

function getProductInfo(product, content) {
  var productContent = '<div><a href="'+product.url+'">'
  if (product.first_image) {
    productContent += '<img src="'+product.first_image.medium_url+'" />';
  }
  productContent += '</a></div>';

  productContent += getRow('Товар', product.title);

  if (product.sku) {
    productContent += getRow('Артикул', product.sku);
  }

  return content + productContent;
}

function getRow(key, value) {
  return '<div><strong>'+key+':</strong> '+value+'</div>';
}

function getContentHtml(owner, content) {
  var resultContent = content;
  var $html = owner.$element.find( '['+owner.options.selectors.html+']' );
  $html.each(function(index, el) {
    resultContent += $(el).html();
  });
  return resultContent;
}

function getCustomContent(owner, content) {
  var resultContent = content;
  var $customContent = owner.$element.find( '['+owner.options.selectors.customContent+']' );
  $customContent.each(function(index, el) {
    var key = $(el).data( owner.options.selectors.customContent.replace('data-', '') );
    var value = $(el).val();
    if (!value) {
      value = $(el).html();
    }
    resultContent += getRow(key, value);
  });
  return resultContent;
}

function updateContentTop(content, messageContent) {
  var _messageContent = '<br />' + messageContent + '<br />';
  return content + _messageContent;
}
function updateContentFooter(content) {
  var pageLink = '<br /> Отправлено со страницы: ' +  getPageLink();
  return content + pageLink;
}

module.exports = updateContentData;
},{"./helpers":3}],8:[function(require,module,exports){
var system = require('../variables').system;
var updateContentData = require('./updateContentData');
var testRequire = require('./helpers').testRequire;
var getPhoneNumberLength = require('./helpers').getPhoneNumberLength;

function checkDuplicateId($element) {
  var $node = $element.get(0);
  if ($node.id) {
    var $selector = $('[id="'+$node.id+'"]');
    if ($selector.length > 1) {
      console.warn('Внимание! Задвоенный идентификатор - #' + $node.id + '. Форма может не корректно отправляться.');
    }
  }
}

function checkProduct() {
  return window.location.pathname.indexOf('/product/') > -1;
}

function validateFormData(dataForm) {
  var self = this;
  var result = $.Deferred();
  var errors = [];
  var _require = self.options.require;
  var updateFormData = dataForm;

  var isFromRequire = testRequire('from', _require);
  var validateFromResult = validateFrom(updateFormData.from, isFromRequire, self.options.errorMessages.from);
  updateFormData.from = validateFromResult.value;
  if (validateFromResult.isError) {
    errors.push({
      name: 'from',
      errorMessage: validateFromResult.errorMessage
    })
  };

  var isPhoneRequire = testRequire('phone', _require);
  var validatePhoneResult = validatePhone(updateFormData.phone, isPhoneRequire, self.options.phoneNumberLength, self.options.errorMessages.phone);
  updateFormData.phone = validatePhoneResult.value;
  if (validatePhoneResult.isError) {
    errors.push({
      name: 'phone',
      errorMessage: validatePhoneResult.errorMessage
    })
  };

  var isNameRequire = testRequire('name', _require);
  var validateNameResult = validateName(updateFormData.name, isNameRequire, self.options.errorMessages.name);
  updateFormData.name = validateNameResult.value;
  if (validateNameResult.isError) {
    errors.push({
      name: 'name',
      errorMessage: validateNameResult.errorMessage
    })
  };

  var isSubjectRequire = testRequire('subject', _require);
  var validateSubjectResult = validateSubject(updateFormData.subject, isSubjectRequire, self.options.errorMessages.subject);
  updateFormData.subject = validateSubjectResult.value;
  if (validateSubjectResult.isError) {
    errors.push({
      name: 'subject',
      errorMessage: validateSubjectResult.errorMessage
    })
  };

  if (!self.options.useDefaultContent && !updateFormData.content) {

    var validateContentResult = validateContent(updateFormData.content, !self.options.useDefaultContent, self.options.errorMessages.content);
    updateFormData.content = validateContentResult.value;

    if (validateContentResult.isError) {
      errors.push({
        name: 'content',
        errorMessage: validateContentResult.errorMessage
      });
    };

    if (errors.length > 0) {
      result.reject(errors);
    }
    else{
      result.resolve(updateFormData);
    }

  }else{
  updateContentData(self, updateFormData.content, errors.length > 0).done(function (_content) {
    updateFormData.content = _content;
    var validateContentResult = validateContent(updateFormData.content, !self.options.useDefaultContent);
    updateFormData.content = validateContentResult.value;

    if (validateContentResult.isError) {
      errors.push({
        name: 'content',
        errorMessage: validateContentResult.errorMessage
      });
    };

    if (errors.length > 0) {
      result.reject(errors);
    }
    else{
      result.resolve(updateFormData);
    }
  });

  }

  return result.promise();
}

function validatePhone(phone, isRequire, phoneNumberLength, errorMessage) {
  var result = {
    isError: false,
    errorMessage: errorMessage,
    value: decodeURIComponent(phone)
  };

  phone = decodeURIComponent(phone)

  if (!isRequire && phone && phone == '' || !isRequire && !phone) {
    result.value = system.dataDefault.phone;
  }
  else {
    if (!phone || phone == '') {
      result.isError = true;
    }else{
      var numLen = getPhoneNumberLength(phone);

      if (phoneNumberLength != numLen) {
        result.isError = true;
      }
    }
  }

  return result;
}

function validateFrom(from, isRequire, errorMessage) {
  var result = {
    isError: false,
    errorMessage: errorMessage,
    value: from
  };

  if (!isRequire && from && from == '' || !isRequire && !from) {
    var _host = window.location.host;
    if (_host.indexOf('.') == -1) {
      _host = 'myinsales.ru'
    }
    result.value = 'shop@' + _host;
  }
  else {
    if (!from || from == '') {
      result.isError = true;
    }
  }

  return result;
}

function validateName(name, isRequire, errorMessage) {
  var result = {
    isError: false,
    errorMessage: errorMessage,
    value: name
  };

  if (!isRequire && name && name == '' || !isRequire && !name) {
    result.value = system.dataDefault.name;
  }
  else {
    if (!name || name == '') {
      result.isError = true;
    }
  }

  return result;
}

function validateSubject(subject, isRequire, errorMessage) {
  var result = {
    isError: false,
    errorMessage: errorMessage,
    value: subject
  };

  if (!isRequire && subject && subject == '' || !isRequire && !subject) {
    result.value = system.dataDefault.subject;
  }
  else {
    if (!subject || subject == '') {
      result.isError = true;
    }
  }

  return result;
}

function validateContent(content, isRequire, errorMessage) {
  var result = {
    isError: false,
    errorMessage: errorMessage,
    value: content
  };
  if (!content) {
    result.isError = true;
    result.value = '';
  }else{
    var trimContent = content.trim();

    if (!isRequire && content && trimContent == '' || !isRequire && !content) {
      result.value = system.dataDefault.content;
    }
    else {
      if (!content || trimContent == '') {
        result.isError = true;
      }
    }
  }

  return result;
}

function checkNameContent($form) {
  var $content = $form.find('[name="content"]');
  if ($content.length == 0) {
    console.warn('В форме отсутствует поле content', $form);
  }
}

module.exports = {
  'checkDuplicateId': checkDuplicateId,
  'checkProduct': checkProduct,
  'checkNameContent': checkNameContent,
  'validateFormData': validateFormData
}
},{"../variables":10,"./helpers":3,"./updateContentData":7}],9:[function(require,module,exports){
var Feedback = require('feedback');
var system = require('variables').system;

(function ( $, window, undefined ) {
  var old = $.fn.InSalesFeedback;

  $.fn.InSalesFeedback = function (option) {
    return this.each(function () {
      var $self = $(this);
      var options = typeof option == 'object' && option;
      var data = $self.data(system.NAME);

      if (!data && 'destroy' === option) {
        return;
      }
      if (!data) {
        $self.data(system.NAME, (data = new Feedback($self, options)));
      }
      if (typeof option == 'string') {
        data[option]();
      }
    })
  }

  $.fn.InSalesFeedback.defaults = require('variables').defaults;

  $.fn.InSalesFeedback.noConflict = function () {
    $.fn.InSalesFeedback = old;
    return this;
  }
})(jQuery, window);
},{"feedback":4,"variables":10}],10:[function(require,module,exports){
var defaults = {
  includeProductInfo: true, 
  messageContent: null, 
  urlPageOnContent: true, 
  useJqueryToggle: true, 
  hideSuccessMessageTimer: 5000, 
  hideErrorOnFocus: true, 
  resetFormOnSubmit: true, 
  useDefaultContent: true, 
  phoneNumberLength: 11, 
  require: [], 
  onSuccess: function(){}, 
  onFail: function(){}, 
  onError: function(){}, 
  customValidate: null, 
  classes: {
    errorInput: 'is-error-feedback-input',
    errorField: 'is-error-feedback-field',
    errorForm: 'is-error-feedback',
    failForm: 'is-fail-feedback'
  },
  errorMessages: {
    from: 'Не заполнено поле e-mail',
    phone: 'Укажите номер в правильном формате!',
    name: 'Не заполнено поле имя',
    subject: 'Не заполнено поле тема сообщения',
    content: 'Не заполнено поле текст сообщения'
  },
  messages: {
    success: 'Сообщение успешно отправлено!',
    fail: 'Сообщение не отправлено, попробуйте ещё раз!',
    error: 'Неверно заполнены поля!'
  },
  selectors: {
    html: 'data-feedback-html', 
    customContent: 'data-feedback-custom-content', 
    submit: 'data-feedback-submit', 
    field: 'data-feedback-field', 
    input: 'data-feedback-input', 
    inputError: 'data-feedback-input-error', 
    success: 'data-feedback-success', 
    error: 'data-feedback-error', 
    errors: 'data-feedback-errors' 
  }
}

var system = {
  NAME: 'InSalesFeedback',
  VERSION: '0.9.0',
  NAMESPACE: '.InSalesFeedback',
  names: {
    from: 'from', 
    name: 'name', 
    phone: 'phone', 
    subject: 'subject', 
    content: 'content' 
  },
  dataDefault: {
    from: 'shop@myinsales.ru', 
    name: 'не заполнено', 
    phone: 'не заполнено', 
    subject: 'Заказ обратного звонка.', 
    content: 'Заказ обратного звонка.' 
  },
  events: {
    success: 'success::feedback', 
    fail: 'fail::feedback', 
    error: 'error::feedback' 
  }
}

module.exports = {
  'defaults': defaults,
  'system': system
}
},{}]},{},[9]);
