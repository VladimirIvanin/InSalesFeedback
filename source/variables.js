var defaults = {
  selectors: {
    submit: 'data-feedback-submit'
  }
}

var system = {
  NAME: 'InSalesFeedback',
  VERSION: '0.0.1',
  NAMESPACE: '.InSalesFeedback',
  ajax: {
    url: '/client_account/feedback.json',
    type: 'POST',
    dataType: 'json'
  }
}

module.exports = {
  defaults,
  system
}
