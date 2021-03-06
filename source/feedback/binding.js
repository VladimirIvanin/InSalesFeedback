var parseSerialize = require('./helpers').parseSerialize;
var getFailerrors = require('./helpers').getFailerrors;
var getDataAttrName = require('./helpers').getDataAttrName;
var checkAgree = require('./validate').checkAgree;
var system = require('../variables').system;

/**
 * Привязываем события
 */
function binding() {
  var self = this;
  var options = self.options;
  var $form = self.$element;
  var $submit = $form.find( getDataAttrName(options.selectors.submit) );
  var $agree = $form.find( getDataAttrName(options.selectors.agree) );

  $form.on('submit', function(event) {
    self.eventMachine('before', $form, {});
    event.preventDefault();

    var agreeSelector = self.options.selectors.agree;
    var isAgree = checkAgree($form, agreeSelector, self.options.useAgree, self.options.errorMessages);


    var dataForm = parseSerialize(serialize($form.get(0)));
    var customValidate = self.options.customValidate;

    if (!isAgree) {
      self.eventMachine('notagree', $form, dataForm);
      self.eventMachine('after', $form, dataForm);
      return;
    }

    // если есть кастомная валидация
    if (customValidate && typeof customValidate == 'function') {

      var isDone = customValidate($form, dataForm, self);
      if (isDone) {
        // Системная валидация
        self.validateFormData(dataForm).done(function (updateFormData) {
          self.sendMessage(updateFormData).done(function (onDone) {
            onDone.formData = dataForm;
            self.eventMachine('success', $form, onDone);
            self.eventMachine('after', $form, dataForm);
          })
          .fail(function (onFail) {
            var err = getFailerrors(onFail);
            self.errorRender(err);
            self.eventMachine('fail', $form, onFail);
            self.eventMachine('after', $form, dataForm);
          });
        })
        .fail(function (onErrorData) {
          self.errorRender(onErrorData);
          self.eventMachine('error', $form, onErrorData);
          self.eventMachine('after', $form, dataForm);
        });
      }else{
        self.eventMachine('error', $form, dataForm);
        self.eventMachine('after', $form, dataForm);
      }

    }
    else{
      // Системная валидация
      self.validateFormData(dataForm).done(function (updateFormData) {
        self.sendMessage(updateFormData).done(function (onDone) {
          onDone.formData = dataForm;
          self.eventMachine('success', $form, onDone);
          self.eventMachine('after', $form, dataForm);
        })
        .fail(function (onFail) {
          var err = getFailerrors(onFail);
          self.errorRender(err);
          self.eventMachine('fail', $form, onFail);
          self.eventMachine('after', $form, dataForm);
        });
      })
      .fail(function (onErrorData) {
        self.errorRender(onErrorData);
        self.eventMachine('error', $form, onErrorData);
        self.eventMachine('after', $form, dataForm);
      });

    }
  });

  $agree.click(function(event) {
    var isActive = $(this).prop('checked');
    self.eventMachine('before', $form, {});
    if (isActive) {
      var dataForm = parseSerialize($form.serialize());
      self.eventMachine('agree', $form, dataForm);
      self.eventMachine('after', $form, dataForm);
      self.successRender(true);
      triggerSubmit(true);
    }else{
      if (options.showMessageAgree) {
        self.errorRender([{
          name: 'agree',
          errorMessage: self.options.errorMessages.agree
        }]);
      }
      triggerSubmit(false);
    }
  });

  $(document).on(system.events.success, function(event) {
    var _mainUUID = self.UUID;
    var eventUUID = event.InSalesFeedback.$target[0].InSalesFeedbackUUID;
    if (_mainUUID === eventUUID) {
      if (self.options.resetFormOnSubmit) {
        $form.trigger('reset');
      }
      self.successRender();
    }
  });

  $(document).on(system.events.notagree, function(event) {
    var _mainUUID = self.UUID;
    var eventUUID = event.InSalesFeedback.$target[0].InSalesFeedbackUUID;
    if (_mainUUID === eventUUID) {
      if (options.showMessageAgree) {
        self.errorRender([{
          name: 'agree',
          errorMessage: self.options.errorMessages.agree
        }]);
      }

      triggerSubmit(false);
    }
  });

  function triggerSubmit(isActive) {
    if ($submit.length === 0) {
      console.warn('Отсутствует кнопка отправления формы.');
      $submit = $form.find( '[type="submit"]' );
    }

    if (!isActive) {
      $submit.addClass(options.classes.disabledButton).prop('disabled', true).attr('disabled', 'disabled');
      $agree.addClass(options.classes.errorAgree)
    }else{
      $submit.removeClass(options.classes.disabledButton).prop('disabled', false).removeAttr('disabled', 'disabled');
      $agree.removeClass(options.classes.errorAgree)
    }
  }
}
function serialize (form) {
    if (!form || form.nodeName !== "FORM") {
            return;
    }
    var i, j, q = [];
    for (i = form.elements.length - 1; i >= 0; i = i - 1) {
        if (form.elements[i].name === "") {
            continue;
        }
        switch (form.elements[i].nodeName) {
            case 'INPUT':
                switch (form.elements[i].type) {
                    case 'text':
                    case 'tel':
                    case 'email':
                    case 'hidden':
                    case 'password':
                    case 'button':
                    case 'reset':
                    case 'submit':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    case 'checkbox':
                    case 'radio':
                        if (form.elements[i].checked) {
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        }
                        break;
                }
                break;
                case 'file':
                break;
            case 'TEXTAREA':
                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                    break;
            case 'SELECT':
                switch (form.elements[i].type) {
                    case 'select-one':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    case 'select-multiple':
                        for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                            if (form.elements[i].options[j].selected) {
                                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                            }
                        }
                        break;
                }
                break;
            case 'BUTTON':
                switch (form.elements[i].type) {
                    case 'reset':
                    case 'submit':
                    case 'button':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                }
                break;
            }
        }
    return q.join("&");
}


module.exports = binding;
