# Плагин для отправки сообщений на платформе InSales

## CDN

```html
  <script src="https://cdn.jsdelivr.net/gh/VladimirIvanin/InSalesFeedback@0.15.0/dist/feedback.js"></script>
```

## Настройки

### Параметры

| Параметр                | Тип     | Значение поумолчанию | Описание                                                                                               |
|-------------------------|---------|----------------------|--------------------------------------------------------------------------------------------------------|
| require                 | array   | []                   | Обязательные поля. Например ['phone', 'name']                                                          |
| useDefaultContent       | boolean | true                 | Если поля контент нет, то заполниться значение по умолчанию или из доп параметров и кастомных настроек |
| useAgree       | boolean | false                 | Проверять согласие на обработку персональных данных? |
| showMessageAgree       | boolean | false                 |  Выводить сообщение об ошибке согласия в блок ошибок? |
| includeProductInfo       | boolean | true                 | Добавлять информацию о товаре на странице товара? |
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
    errorAgree: 'is-error-agree-feedback',
    disabledButton: 'is-disabled-feedback',
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
    submit: 'data-feedback-submit', // кнопка отправить
    agree: 'data-feedback-agree', // чекбокс согласие на обработку персональных данных
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
  onBefore: function(){}, // перед отправкой
  onAfter: function(){}, // после любого действия
  onAgree: function(){}, // Проверка согласия прошла удачно
  onNotagree: function(){}, // Ошибка при проверке согласия
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
    agree: 'Необходимо принять условия передачи информации',
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
  $('.js-feedback').InSalesFeedback({
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
<form class="feedback js-feedback" action="/client_account/feedback" method="post">

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

  <input data-feedback-custom-content="кастомное поле 1" placeholder="кастомное значение 1" type="text" class="feedback-field text-field" />
  <input data-feedback-custom-content="кастомное поле 2" placeholder="кастомное значение 2" type="text" class="feedback-field text-field" />

  <div data-feedback-html>
    <h2>
      Кастомный контент в виде html.
    </h2>
    <p>
      Внимание! Если добавить сюда много ссылок или специфичную верстку, скорее всего такой контент будет вырезан сервером почты. Переносы строки заменяются на <br>, т.е. в таком виде стоит избегать переносов строки.
    </p>
  </div>

  <div class="feedback-row form-error" data-feedback-errors>
  </div>
  <div class="feedback-row form-done" data-feedback-success>
  </div>

  <div class="feedback-row">
    <label>
      <span>
        Cогласиться на обработку персональных данных
      </span>
      <input type="checkbox" name="" value="" data-feedback-agree>
    </label>
  </div>

  <div class="feedback-row">
    <button type="submit" name="button" data-feedback-submit>
      Заказать
    </button>
  </div>

  {% if language.not_default? %}
  <input type="hidden" name="lang" value="{{ language.locale }}"/>
  {% endif %}
  <input type="hidden" name="subject" value="Обратный звонок">

</form>
```

## Плагины для InSales

- [Избранное](https://github.com/VladimirIvanin/favorites)
- [Ранее просмотренные товары](https://github.com/VladimirIvanin/RecentlyView)
- [Определение местоположения пользователя](https://github.com/VladimirIvanin/geoManager)
