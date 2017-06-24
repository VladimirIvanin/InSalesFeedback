var parseSerialize = require('./helpers').parseSerialize;
var system = require('../variables').system;

/**
 * Привязываем события
 */
function binding() {
  var self = this;
  var $form = self.$element;

  $form.on('submit', function(event) {
    event.preventDefault();

    var dataForm = parseSerialize($form.serialize());
    var customValidate = self.options.customValidate;

    // если есть кастомная валидация
    if (customValidate && typeof customValidate == 'function') {

      var isDone = customValidate($form, dataForm);
      if (isDone) {
        self.sendMessage(dataForm).done(function (onDone) {
          self.eventMachine('success', $form, onDone);
        })
        .fail(function (onFail) {
          self.eventMachine('fail', $form, onFail);
        });
      }else{
        self.eventMachine('error', $form, dataForm);
      }

    }
    else{
      // Системная валидация
      self.validateFormData(dataForm).done(function (updateFormData) {
        self.sendMessage(updateFormData).done(function (onDone) {
          self.eventMachine('success', $form, onDone);
        })
        .fail(function (onFail) {
          self.eventMachine('fail', $form, onFail);
        });
      })
      .fail(function (onErrorData) {
        self.errorRender(onErrorData);
        self.eventMachine('error', $form, onErrorData);
      });

    }
  });

  $(document).on(system.events.success, function(event) {
    if (self.options.resetFormOnSubmit) {
      if ($form.get(0)) {
        $form.get(0).reset();
      }
    }
    self.successRender();
  });
}

module.exports = binding;
