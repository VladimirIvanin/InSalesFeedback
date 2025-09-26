var parseSerialize = require('./helpers').parseSerialize;

/**
 * Конфигурационный мап для трансформации полей
 * 
 * Каждое правило содержит:
 * - sourceField: исходное поле в форме
 * - feedbackField: поле в объекте feedback (может быть null, если не нужно добавлять в feedback)
 * - topLevelField: поле на верхнем уровне (может быть null, если не нужно добавлять на верхний уровень)
 * 
 * Примеры использования:
 * 
 * 1. Поле добавляется и в feedback, и на верхний уровень:
 *    'field-name': {
 *      sourceField: 'field-name',
 *      feedbackField: 'feedback[field-name]',
 *      topLevelField: 'field-name'
 *    }
 * 
 * 2. Поле только на верхний уровень:
 *    'field-name': {
 *      sourceField: 'field-name',
 *      feedbackField: null,
 *      topLevelField: 'transformed-name'
 *    }
 * 
 * 3. Поле только в feedback:
 *    'field-name': {
 *      sourceField: 'field-name',
 *      feedbackField: 'feedback[field-name]',
 *      topLevelField: null
 *    }
 */
var FIELD_TRANSFORM_MAP = {
  'yandex-smart-token': {
    sourceField: 'yandex-smart-token',
    feedbackField: 'feedback[yandex-smart-token]',
    topLevelField: 'yandex-smart-token'
  },
  'smart-token': {
    sourceField: 'smart-token',
    feedbackField: null,
    topLevelField: 'yandex-smart-token'
  }
};

/**
 * Функция для трансформации имен полей на основе конфигурационного мапа
 * @param {Object} dataForm - данные формы
 * @returns {Object} трансформированные данные
 */
function transformFieldNames (dataForm) {
  var transformedData = {};
  var specialFields = {};
  var key = '';
  var transformRule = null;
  
  // Копируем все поля в transformedData
  for (key in dataForm) {
    if (dataForm.hasOwnProperty(key)) {
      transformedData[key] = dataForm[key];
    }
  }
  
  // Обрабатываем поля согласно правилам трансформации
  for (key in dataForm) {
    if (dataForm.hasOwnProperty(key)) {
      transformRule = FIELD_TRANSFORM_MAP[key];
      
      if (transformRule) {
        // Добавляем поле в feedback, если указано в правиле
        if (transformRule.feedbackField) {
          transformedData[transformRule.feedbackField] = dataForm[key];
        }
        
        // Добавляем поле на верхний уровень, если указано в правиле
        if (transformRule.topLevelField) {
          specialFields[transformRule.topLevelField] = dataForm[key];
        }
      }
    }
  }
  
  return {
    feedback: transformedData,
    specialFields: specialFields
  };
}

/**
 * Отправка сообщения обратной связи
 * @param {Object} dataForm - данные формы
 * @returns {Object} promise объект
 */
function sendMessage (dataForm) {
  var result = $.Deferred();
  var search = parseSerialize(window.location.search);
  var _lang = search.lang || '';
  var transformed = {};
  var _message = {};
  var key = '';
  
  // Трансформируем имена полей
  transformed = transformFieldNames(dataForm);
  _message = {
    lang: _lang,
    feedback: transformed.feedback
  };
  
  // Добавляем специальные поля на верхний уровень
  for (key in transformed.specialFields) {
    if (transformed.specialFields.hasOwnProperty(key)) {
      _message[key] = transformed.specialFields[key];
    }
  }

  if (Shop && Shop.config && Shop.config.config && 
      Shop.config.config.captcha_type === 'google') {
    _message['g-recaptcha-response'] = dataForm['g-recaptcha-response'];
  }

  $.post('/client_account/feedback.json', $.param(_message))
    .done(function (response) {
      if (_message && response.status === 'ok') {
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
