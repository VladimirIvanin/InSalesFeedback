/* global $ */
var Feedback = require('feedback');
var system = require('variables').system;
var checkDuplicateId = require('./feedback/validate').checkDuplicateId;

(function ( $, window, undefined ) {
  var old = $.fn.InSalesFeedback;

  $.fn.InSalesFeedback = function (option) {
    return this.each(function (index) {
      var $self = $(this);
      var options = typeof option == 'object' && option;
      var data = $self.data(system.NAME);

      if (!data && 'destroy' === option) {
        return;
      }
      if (!data) {
        $self.data(system.NAME, (data = new Feedback($self, options)));
      }
      if (typeof option == 'string') {
        data[option]();
      }
    })
  };

  $.fn.InSalesFeedback.defaults = require('variables').defaults;

  $.fn.InSalesFeedback.noConflict = function () {
    $.fn.InSalesFeedback = old;
    return this;
  }
})(jQuery, window);
