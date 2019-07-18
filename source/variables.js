var defaults = {
  useAgree: false, // Проверять согласие на обработку персональных данных?
  showMessageAgree: false, // выводить сообщение об ошибке согласия в блок ошибок?
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
  onBefore: function(){}, // перед отправкой
  onAfter: function(){}, // после любого действия
  onAgree: function(){}, // Проверка согласия прошла удачно
  onNotagree: function(){}, // Ошибка при проверке согласия
  customValidate: null, // Своя валидация. Должна возвращать true/false. customValidate($form, dataForm). Синхронная функция
  classes: {
    errorInput: 'is-error-feedback-input',
    errorField: 'is-error-feedback-field',
    errorForm: 'is-error-feedback',
    errorAgree: 'is-error-agree-feedback',
    disabledButton: 'is-disabled-feedback',
    failForm: 'is-fail-feedback'
  },
  errorMessages: {
    from: 'Поле e-mail имеет неверное значение',
    phone: 'Укажите номер в международном формате',
    name: 'Не заполнено поле имя',
    subject: 'Не заполнено поле тема сообщения',
    agree: 'Необходимо принять условия передачи информации',
    content: 'Не заполнено поле текст сообщения'
  },
  messages: {
    send_from: 'Отправлено со страницы',
    product: 'Продукт',
    sku: 'Артикул',
    default_value: 'Не заполнено',
    success: 'Сообщение успешно отправлено!',
    fail: 'Сообщение не отправлено, попробуйте ещё раз!',
    error: 'Неверно заполнены поля!'
  },
  selectors: {
    html: 'data-feedback-html', // контент из html
    customContent: 'data-feedback-custom-content', // кастомные строки контента (Принимает название строки, содержимое берется как из инпута `type=text, textarea` так и из html *val()/html()*)
    submit: 'data-feedback-submit', // кнопка отправить
    agree: 'data-feedback-agree', // чекбокс согласие на обработку персональных данных
    field: 'data-feedback-field', // обертка инпута и лейбла
    input: 'data-feedback-input', // инпут с данными
    inputError: 'data-feedback-input-error', // ошибка инпута
    success: 'data-feedback-success', // поле для уведомления
    error: 'data-feedback-error', // поле для вывода ошибки (общее)
    errors: 'data-feedback-errors' // поле для вывода ошибок
  }
}

var system = {
  NAME: 'InSalesFeedback',
  VERSION: '0.14.2',
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
    name: '', // Имя отправителя
    phone: '', // телефон отправителя
    subject: 'Заказ обратного звонка.', // тема сообщения
    content: 'Заказ обратного звонка.' // тело сообщения (обязательное)
  },
  events: {
    before: 'before::feedback', // перед отправкой
    after: 'after::feedback', // после любого действия
    success: 'success::feedback', // сообщение успешно отправлено
    fail: 'fail::feedback', // Ошибка при отправке сообщения
    agree: 'agree::feedback', // Проверка согласия
    notagree: 'notagree::feedback', // Ошибка при проверке согласия
    error: 'error::feedback' // Ошибка валидации
  }
}

module.exports = {
  'defaults': defaults,
  'system': system
}
