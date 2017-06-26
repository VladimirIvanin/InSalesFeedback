# Плагин для отправки сообщений на платформе InSales

## CDN

```html
  <script src="https://cdn.jsdelivr.net/gh/VladimirIvanin/InSalesFeedback@0.11.0/dist/feedback.js"></script>
```

## Настройки

### Параметры

| Параметр                | Тип     | Значение поумолчанию | Описание                                                                                               |
|-------------------------|---------|----------------------|--------------------------------------------------------------------------------------------------------|
| require                 | array   | []                   | Обязательные поля. Например ['phone', 'name']                                                          |
| useDefaultContent       | boolean | true                 | Если поля контент нет, то заполниться значение по умолчанию или из доп параметров и кастомных настроек |
| resetFormOnSubmit       | boolean | true                 | Очистить форму после отправки?                                                                         |
| hideErrorOnFocus        | boolean | true                 | Скрывать ошибки при вводе?                                                                             |
| useJqueryToggle         | boolean | true                 | Использовать переключения show/hide для уведомлений?                                                   |
| urlPageOnContent        | boolean | true                 | Добавлять в сообщение ссылку на страницу?                                                              |
| messageContent          | string  | null                 | Контент письма                                                                                         |
| hideSuccessMessageTimer | number  | 5000                 | Через сколько скрыть сообщение об успешной отправке?                                                   |
| phoneNumberLength       | number  | 11                   | Сколько цифр нужно в номере телефона?                                                                  |

### Классы

```js
{
  classes: {
    errorInput: 'is-error-feedback-input',
    errorField: 'is-error-feedback-field',
    errorForm: 'is-error-feedback',
    failForm: 'is-fail-feedback'
  }
}
```

### Селекторы

```js
{
  selectors: {
    html: 'data-feedback-html', // контент из html
    customContent: 'data-feedback-custom-content', // кастомные строки контента (Принимает название строки, содержимое берется как из инпута так и из html val()/html())
    field: 'data-feedback-field', // обертка инпута
    inputError: 'data-feedback-input-error', // ошибка инпута (должна быть внутри data-feedback-field)
    success: 'data-feedback-success', // поле для уведомления
    error: 'data-feedback-error', // поле для вывода ошибки (общее)
    errors: 'data-feedback-errors' // поле для вывода текста ошибок инпутов
  }
}
```

### Callbacks

```js
{
  onSuccess: function(){}, // сообщение успешно отправлено
  onFail: function(){}, // Ошибка при отправке сообщения
  onError: function(){}, // Ошибка валидации
  customValidate: null, // Своя валидация. Должна возвращать true/false. customValidate($form, dataForm). Синхронная функция.
}
```

### Фразы

```js
{
    // фразы ошибок под инпутом
    errorMessages: {
    from: 'Поле e-mail имеет неверное значение',
    phone: 'Укажите номер в правильном формате!',
    name: 'Не заполнено поле имя',
    subject: 'Не заполнено поле тема сообщения',
    content: 'Не заполнено поле текст сообщения'
  },
  // фразы блоков data-feedback-success/data-feedback-error
  messages: {
    success: 'Сообщение успешно отправлено!',
    fail: 'Сообщение не отправлено, попробуйте ещё раз!',
    error: 'Неверно заполнены поля!'
  }
}

```

## Пример

```js
$(document).ready(function() {
  $('#feedback-form').InSalesFeedback({
    require: ['phone'],
    onError: function(data) {
      // Ошибка валидации
      console.log(data);
    },
    onSuccess: function(data) {
      // сообщение успешно отправлено
      console.log(data);
    },
    onFail: function(data) {
      // Ошибка при отправке сообщения
      console.log(data);
    }
  });
});
```

```liquid
<form id="feedback-form" class="feedback" action="/client_account/feedback" method="post">

  <div class="feedback-row" data-feedback-field>
    <div class="feedback-field-wrap">
      <input placeholder="Имя" name="name" type="text" class="feedback-field text-field" />
    </div>
    <div data-feedback-input-error></div>
  </div>

  <div class="feedback-row is-required" data-feedback-field>
    <div class="feedback-field-wrap">
      <input placeholder="Телефон" name="phone" type="text" class="feedback-field text-field" />
    </div>
    <div data-feedback-input-error></div>
  </div>

  <div class="feedback-row" data-feedback-field>
    <div class="feedback-field-wrap">
      <textarea placeholder="ваш вопрос" name="content" rows="4" class="feedback-field">
        Заказ звонка
      </textarea>
    </div>
    <div data-feedback-input-error></div>
  </div>

  <div class="feedback-row form-error" data-feedback-error>
  </div>
  <div class="feedback-row form-done" data-feedback-success>
  </div>

  <div class="feedback-row">
    <button type="submit" name="button">
      Заказать
    </button>
  </div>

  {% if language.not_default? %}
  <input type="hidden" name="lang" value="{{ language.locale }}"/>
  {% endif %}
  <input type="hidden" name="subject" value="Обратный звонок">

</form>
```
