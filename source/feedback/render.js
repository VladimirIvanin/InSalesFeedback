var getDataAttrName = require('./helpers').getDataAttrName;

function errorRender(errors) {
  var self = this;
  var fieldSelector = getDataAttrName(self.options.selectors.field) + ':first';
  var inputErrorSelector = getDataAttrName(self.options.selectors.inputError);
  var errorSelector = getDataAttrName(self.options.selectors.error);

  $.each(errors, function(index, el) {
    var errorClass = self.options.classes.errorInput;
    var errorClassField = self.options.classes.errorField;
    var $input = $('[name="'+el.name+'"]');
    var $field = $input.parents( fieldSelector )
    var $inputErrorSelector = $field.find( inputErrorSelector )
    $input.addClass(errorClass);
    $field.addClass(errorClassField);
    $inputErrorSelector.html(el.errorMessage).show();

    if (self.options.hideErrorOnFocus) {
      $input.on('click', function(event) {
        $input.removeClass(errorClass);
        $field.removeClass(errorClassField);
        $inputErrorSelector.html('').hide();
        self.$element.find(errorSelector).html('').hide();
      });
    }
  });

  if (errors && errors.length) {
    self.$element.addClass(self.options.classes.errorForm);
    self.$element.find(errorSelector).html(self.options.messages.error).show();
  }
}

function successRender() {
  var self = this;
  var errorClass = self.options.classes.errorInput;
  var errorClassField = self.options.classes.errorField;

  var fieldSelector = getDataAttrName(self.options.selectors.field);
  var inputErrorSelector = getDataAttrName(self.options.selectors.inputError);
  var errorSelector = getDataAttrName(self.options.selectors.error);

  self.$element.find('[name]').removeClass(errorClass);
  self.$element.find(fieldSelector).removeClass(errorClassField);
  self.$element.find(inputErrorSelector).html('').hide();
  self.$element.find(errorSelector).html('').hide();
  self.$element.removeClass(self.options.classes.errorForm);
}

module.exports = {
  'errorRender': errorRender,
  'successRender': successRender
};
