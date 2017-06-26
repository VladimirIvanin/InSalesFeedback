var parseSerialize = require('./helpers').parseSerialize;
var getFailerrors = require('./helpers').getFailerrors;
var system = require('../variables').system;

/**
 * Привязываем события
 */
function binding() {
  var self = this;
  var $form = self.$element;

  $form.on('submit', function(event) {
    self.eventMachine('before', $form, {});
    event.preventDefault();

    var dataForm = parseSerialize($form.serialize());
    var customValidate = self.options.customValidate;


    // если есть кастомная валидация
    if (customValidate && typeof customValidate == 'function') {

      var isDone = customValidate($form, dataForm);
      if (isDone) {
        self.sendMessage(dataForm).done(function (onDone) {
          self.eventMachine('success', $form, onDone);
          self.eventMachine('after', $form, dataForm);
        })
        .fail(function (onFail) {
          self.eventMachine('fail', $form, onFail);
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

  $(document).on(system.events.success, function(event) {
    if (self.options.resetFormOnSubmit) {
      $form.trigger('reset');
    }
    self.successRender();
  });
}



module.exports = binding;
