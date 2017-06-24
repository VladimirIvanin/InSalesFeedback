# Плагин для отправки сообщений на платформе InSales

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
