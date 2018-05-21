// преобразовать строку в объект
function parseSerialize(string) {
  if (string == "") {
    return {};
  }
  var _data = {};
  var decodeString = decodeURI(string);
  var search = decodeString.replace( '?', '' ).split( '&' );
  var VRegExp = new RegExp(/(([A-Za-z0-9])+)+/g);
  $.each( search, function( index, part ){
    part = part.replace(/^feedback\[/g, '');
    part = part.replace(']=', '=');
    if( part !== '' ){
      part = part.split( '=' );
      part[ 1 ] = part[ 1 ].replace(/%(?!\d+)/g, '%25');
      var VResult = part[0].match(VRegExp);
      var _key = VResult[0];
      if (part[0].indexOf('[]') > -1) {
        if (!_data[ _key ]) {
          _data[ _key ] = [];
        }
        _data[ _key ].push(part[ 1 ]);
      }else{
        if (part[0].indexOf('[') > -1) {
          _key = part[0];
          if (!_data[ VResult[0] ]) {
            _data[ VResult[0] ] = [];
          }
          if (!_data[ VResult[0] ][VResult[1]]) {
            _data[ VResult[0] ][VResult[1]] = [];
          }
          var _part = decodeURIComponent(part[ 1 ]);
          if (_part === 'undefined') {
            _part = '';
          }
          _data[ VResult[0] ][VResult[1]].push(_part);
        }else{
          var _part = decodeURIComponent(part[ 1 ]);
          if (_part === 'undefined') {
            _part = '';
          }
          _data[ part[ 0 ] ] = _part;
        }
      }

    }
  });

  return _data;
}

// Получить ссылку страницы с которой отправлено сообщение
function getPageLink() {
  var url = window.location.href;
  var title = $('title').text();
  return '<a href="'+url+'">' + title + '</a>';
}

function testRequire(name, _require) {
  return _require.indexOf(name) > -1;
}

function getPhoneNumberLength(phone) {
  if (!phone) {
    phone = '';
  }else{
    phone = decodeURIComponent(phone.replace(/%(?!\d+)/g, '%25'));
  }

  var VRegExp = new RegExp(/[\d]/g);
  var VResult = phone.match(VRegExp);
  if (!VResult) {
    VResult = [];
  }

  return VResult.length;
}

function emailTest(email) {
  var _email = email || '';
  var VRegExp = new RegExp(/.+@.+\..+/g);
  var VResult = VRegExp.test(_email);
  return VResult;
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};

// получить ошибки из ответа сервера
function getFailerrors(fail) {
  var result = [];
  if (fail.errors) {
    $.each(fail.errors, function(index, el) {
      result.push({
        name: index,
        errorMessage: el[0] || ''
      })
    });
  }
  return result;
}

function getDataAttrName(name, value) {
  var resultName = (value) ? name + '="'+value+'"' : name;

  return '[' + resultName + ']';
}

module.exports = {
  'parseSerialize': parseSerialize,
  'testRequire': testRequire,
  'generateUUID': generateUUID,
  'emailTest': emailTest,
  'getFailerrors': getFailerrors,
  'getPhoneNumberLength': getPhoneNumberLength,
  'getDataAttrName': getDataAttrName,
  'getPageLink': getPageLink
}
