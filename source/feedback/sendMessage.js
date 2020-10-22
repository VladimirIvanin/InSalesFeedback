var parseSerialize = require('./helpers').parseSerialize;

function sendMessage(dataForm) {
  var result = $.Deferred();
  var search = parseSerialize(window.location.search);
  var _lang = search.lang || '';
  var _message = {
    'lang': _lang,
    'feedback': dataForm,
    'g-recaptcha-response': dataForm['g-recaptcha-response']
  };

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
