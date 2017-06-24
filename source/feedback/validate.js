var system = require('../variables').system;
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

// валидация данных из формы
function validateFormData(dataForm) {
  var self = this;
  var result = $.Deferred();
  var errors = [];
  var _require = self.options.require;
  var updateFormData = dataForm;

  // from (e-mail)
  var isFromRequire = testRequire('from', _require);
  var validateFromResult = validateFrom(updateFormData.from, isFromRequire);
  updateFormData.from = validateFromResult.value;
  if (validateFromResult.isError) {
    errors.push({
      name: 'from',
      errorMessage: validateFromResult.errorMessage
    })
  };

  // phone
  var isPhoneRequire = testRequire('phone', _require);
  var validatePhoneResult = validatePhone(updateFormData.phone, isPhoneRequire, self.options.phoneNumberLength);
  updateFormData.phone = validatePhoneResult.value;
  if (validatePhoneResult.isError) {
    errors.push({
      name: 'phone',
      errorMessage: validatePhoneResult.errorMessage
    })
  };

  // name
  var isNameRequire = testRequire('name', _require);
  var validateNameResult = validateName(updateFormData.name, isNameRequire);
  updateFormData.name = validateNameResult.value;
  if (validateNameResult.isError) {
    errors.push({
      name: 'name',
      errorMessage: validateNameResult.errorMessage
    })
  };

  // subject
  var isSubjectRequire = testRequire('subject', _require);
  var validateSubjectResult = validateSubject(updateFormData.subject, isSubjectRequire);
  updateFormData.subject = validateSubjectResult.value;
  if (validateSubjectResult.isError) {
    errors.push({
      name: 'subject',
      errorMessage: validateSubjectResult.errorMessage
    })
  };

  // content
  var validateContentResult = validateContent(updateFormData.content, !self.options.useDefaultContent);
  updateFormData.content = validateContentResult.value;
  if (validateContentResult.isError) {
    errors.push({
      name: 'content',
      errorMessage: validateContentResult.errorMessage
    })
  };

  if (errors.length > 0) {
    result.reject(errors);
  }
  else{
    result.resolve(updateFormData);
  }

  return result.promise();
}

// Валидация поля phone
function validatePhone(phone, isRequire, phoneNumberLength) {
  var result = {
    isError: false,
    errorMessage: 'Укажите номер в правильном формате!',
    value: phone
  };

  if (!isRequire && phone && phone == '' || !isRequire && !phone) {
    result.value = system.dataDefault.phone;
  }
  else {
    if (!phone || phone == '') {
      // Если пусто
      result.isError = true;
    }else{
      // Если не совпадает формат (кол-во цифр)
      var numLen = getPhoneNumberLength(phone);
      if (phoneNumberLength != numLen) {
        result.isError = true;
      }
    }
  }

  return result;
}

// Валидация поля from
function validateFrom(from, isRequire) {
  var result = {
    isError: false,
    errorMessage: 'Не заполнено поле e-mail',
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

// Валидация поля name
function validateName(name, isRequire) {
  var result = {
    isError: false,
    errorMessage: 'Не заполнено поле имя',
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
function validateSubject(subject, isRequire) {
  var result = {
    isError: false,
    errorMessage: 'Не заполнено поле тема сообщения',
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
function validateContent(content, isRequire) {
  var result = {
    isError: false,
    errorMessage: 'Не заполнено поле текст сообщения',
    value: content
  };

  var trimContent = content.trim()

  if (!isRequire && content && trimContent == '' || !isRequire && !content) {
    result.value = system.dataDefault.content;
  }
  else {
    if (!content || trimContent == '') {
      result.isError = true;
    }
  }

  return result;
}

module.exports = {
  'checkDuplicateId': checkDuplicateId,
  'validateFormData': validateFormData
}
