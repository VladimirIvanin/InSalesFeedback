var system = require('../variables').system;
var updateContentData = require('./updateContentData');
var testRequire = require('./helpers').testRequire;
var emailTest = require('./helpers').emailTest;
var getPhoneNumberLength = require('./helpers').getPhoneNumberLength;

function checkDuplicateId($element) {
  var error = false;
  var $node = $element.get(0);
  if ($node.id) {
    var $selector = $('[id="'+$node.id+'"]');
    if ($selector.length > 1) {
      error = true;
      console.warn('Внимание! Задвоенный идентификатор - #' + $node.id + '. Форма может некорректно отправляться.');
    }
  }

  return error;
}

function checkProduct() {
  return window.location.pathname.indexOf('/product/') > -1;
}

// валидация данных из формы
function validateFormData(dataForm) {
  var self = this;
  var result = $.Deferred();
  var errors = [];
  var _require = self.options.require;
  var updateFormData = dataForm;

  // from (e-mail)
  var isFromRequire = testRequire('from', _require);
  var validateFromResult = validateFrom(updateFormData.from, isFromRequire, self.options.errorMessages.from);
  updateFormData.from = validateFromResult.value;
  if (validateFromResult.isError) {
    errors.push({
      name: 'from',
      errorMessage: validateFromResult.errorMessage
    })
  };

  // phone
  var isPhoneRequire = testRequire('phone', _require);
  var validatePhoneResult = validatePhone(updateFormData.phone, isPhoneRequire, self.options.phoneNumberLength, self.options.errorMessages.phone);
  updateFormData.phone = validatePhoneResult.value;
  if (validatePhoneResult.isError) {
    errors.push({
      name: 'phone',
      errorMessage: validatePhoneResult.errorMessage
    })
  };

  // name
  var isNameRequire = testRequire('name', _require);
  var validateNameResult = validateName(updateFormData.name, isNameRequire, self.options.errorMessages.name);
  updateFormData.name = validateNameResult.value;
  if (validateNameResult.isError) {
    errors.push({
      name: 'name',
      errorMessage: validateNameResult.errorMessage
    })
  };

  // subject
  var isSubjectRequire = testRequire('subject', _require);
  var validateSubjectResult = validateSubject(updateFormData.subject, isSubjectRequire, self.options.errorMessages.subject);
  updateFormData.subject = validateSubjectResult.value;
  if (validateSubjectResult.isError) {
    errors.push({
      name: 'subject',
      errorMessage: validateSubjectResult.errorMessage
    })
  };

  // content
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

// Валидация поля phone
function validatePhone(phone, isRequire, phoneNumberLength, errorMessage) {
  var result = {
    isError: false,
    errorMessage: errorMessage,
    value: decodeURIComponent(phone.replace(/%(?!\d+)/g, '%25'))
  };

  phone = decodeURIComponent(phone.replace(/%(?!\d+)/g, '%25'))

  if (!isRequire && phone && phone == '' || !isRequire && !phone) {
    result.value = system.dataDefault.phone;
  }
  else {
    if (isRequire) {
      if (!phone || phone == '') {
        // Если пусто
        result.isError = true;
      }else{
        // Если не совпадает формат (кол-во цифр)
        var numLen = getPhoneNumberLength(phone);

        if (phoneNumberLength > numLen) {
          result.isError = true;
        }
      }
    }
  }

  return result;
}

// Валидация поля from
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
    if (!from || from == '' || !emailTest(from)) {
      result.isError = true;
    }
  }

  return result;
}

// Валидация поля name
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

// Валидация поля subject
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

// Валидация поля content
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

function checkAgree($form, agreeSelector, useAgree, errorMessages) {
  var confirm = true;

  if (useAgree) {
    var $agreeSelector = $form.find('['+agreeSelector+']');
    if ($agreeSelector.length == 0 || !$agreeSelector.prop('checked')) {
      confirm = false
    }

    if ($agreeSelector.length == 0) {
      console.warn('Отсутствует чекбокс согласия на обработку персональных данных');
    }
  }

  return confirm;
}

module.exports = {
  'checkDuplicateId': checkDuplicateId,
  'checkProduct': checkProduct,
  'checkAgree': checkAgree,
  'checkNameContent': checkNameContent,
  'validateFormData': validateFormData
}
