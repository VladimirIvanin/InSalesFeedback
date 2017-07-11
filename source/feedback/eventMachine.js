var system = require('../variables').system;

function eventMachine(name, $target, data) {
  var self = this;
  var _method = getMethodName(name);
  var _event = getEventName(name);
  var _data = {};
  _data.$target = $target;
  _data[name] = data || {};

  // EventBus
  if (typeof EventBus == 'object' && EventBus.publish) {
    EventBus.publish(_event, _data)
  }

  // jquery events
  var event = jQuery.Event( _event );
  event['InSalesFeedback'] = _data;

  $(document).trigger( event );

  if (self.options[_method] && typeof self.options[_method] == 'function') {
    self.options[_method](_data)
  }
}

function getEventName(name) {
  return system.events[name];
}
function getMethodName(name) {
  return 'on' + capitalize(name);
}

var capitalize = function(_string) {
    return _string.charAt(0).toUpperCase() + _string.slice(1);
}

module.exports = eventMachine;
