/* global $ */

(function ( $, window, undefined ) {
  var old = $.fn.InSalesFeedback;
  var system = require('variables').system;
  $.fn.InSalesFeedback = function (option) {
    return this.each(function () {
      var $this = $(this);
      var options = typeof option == 'object' && option;
      var data = $this.data(system.NAME);
      if (!data && 'destroy' === option) return;
      if (!data) $this.data(system.NAME, (data = new (require('factory'))($this, options)));
      if (typeof option == 'string') data[option]();
    })
  }
  $.fn.InSalesFeedback.defaults = require('variables').defaults;
  // no conflict
  $.fn.InSalesFeedback.noConflict = function () {
    $.fn.InSalesFeedback = old
    return this
  }
})(jQuery, window);
