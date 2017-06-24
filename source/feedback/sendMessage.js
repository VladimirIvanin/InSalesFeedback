var parseSerialize = require('./helpers').parseSerialize;
var getPageLink = require('./helpers').getPageLink;

function sendMessage(dataForm) {
  var self = this;
  var result = $.Deferred();
  var search = parseSerialize(window.location.search);
  var _lang = search.lang || '';
  var _message = {
    lang: _lang,
    feedback: dataForm,
  };

  if (self.options.urlPageOnContent) {
    _message.feedback.content = updateContentFooter(_message.feedback.content);
  }

  $.post('/client_account/feedback.json', _message)
    .done(function (response) {
      if (_message && response.status == 'ok') {
        result.resolve(response);
      }
      else {
        response.message = _message;
        result.reject(response);
      }
    });

  return result.promise();
}

function updateContentFooter(content) {
  var pageLink = '<br /> Отправлено со страницы: ' +  getPageLink();
  return content + pageLink;
}

module.exports = sendMessage;
