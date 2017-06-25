# Плагин для отправки сообщений на платформе InSales

## CDN

```html
  <script src="https://cdn.jsdelivr.net/gh/VladimirIvanin/InSalesFeedback@0.6.0/dist/feedback.js"></script>
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
