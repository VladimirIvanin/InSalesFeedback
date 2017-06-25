var defaults = {
  includeProductInfo: true, // Добавлять информацию о товаре на странице товара?
  messageContent: null, // Контент письма
  urlPageOnContent: true, // Добавлять в сообщение ссылку на страницу?
  useJqueryToggle: true, // Использовать переключения show/hide для уведомлений
  hideSuccessMessageTimer: 5000, // через сколько скрыть сообщение
  hideErrorOnFocus: true, // скрыть ошибку при вводе в инпут
  resetFormOnSubmit: true, // очистить форму после отправки
  useDefaultContent: true, // если поля контент нет, то заполниться значение по умолчанию или из доп параметров и кастомных настроек
  phoneNumberLength: 11, // сколько цифр нужно в номере телефона
  require: [], // обязательные поля. ['phone', 'name']
  onSuccess: function(){}, // сообщение успешно отправлено
  onFail: function(){}, // Ошибка при отправке сообщения
  onError: function(){}, // Ошибка валидации
  customValidate: null, // Своя валидация. Должна возвращать true/false. customValidate($form, dataForm). Синхронная функция
  classes: {
    errorInput: 'is-error-feedback-input',
    errorField: 'is-error-feedback-field',
    errorForm: 'is-error-feedback',
    failForm: 'is-fail-feedback'
  },
  messages: {
    success: 'Сообщение успешно отправлено!',
    fail: 'Сообщение не отправлено, попробуйте ещё раз!',
    error: 'Неверно заполнены поля!'
  },
  selectors: {
    html: 'data-feedback-html', // контент из html
    submit: 'data-feedback-submit', // кнопка отправить (не используется)
    field: 'data-feedback-field', // обертка инпута и лейбла
    input: 'data-feedback-input', // инпут с данными
    inputError: 'data-feedback-input-error', // ошибка инпута
    success: 'data-feedback-success', // поле для уведомления
    error: 'data-feedback-error', // поле для вывода ошибки (общее)
    errors: 'data-feedback-errors' // поле для вывода ошибок (общее)
  }
}

var system = {
  NAME: 'InSalesFeedback',
  VERSION: '0.5.0',
  NAMESPACE: '.InSalesFeedback',
  names: {
    from: 'from', // адрес отправителя
    name: 'name', // имя отправителя
    phone: 'phone', // телефон отправителя
    subject: 'subject', // тема сообщения
    content: 'content' // тело сообщения (обязательное)
  },
  dataDefault: {
    from: 'shop@myinsales.ru', // адрес отправителя
    name: 'не заполнено', // Имя отправителя
    phone: 'не заполнено', // телефон отправителя
    subject: 'Заказ обратного звонка.', // тема сообщения
    content: 'Заказ обратного звонка.' // тело сообщения (обязательное)
  },
  events: {
    success: 'success::feedback', // сообщение успешно отправлено
    fail: 'fail::feedback', // Ошибка при отправке сообщения
    error: 'error::feedback' // Ошибка валидации
  }
}

module.exports = {
  'defaults': defaults,
  'system': system
}
