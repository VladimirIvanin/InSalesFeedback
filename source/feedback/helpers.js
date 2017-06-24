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
    if( part !== '' ){
      part = part.split( '=' );
      if (part[0].indexOf('[]') > -1) {
        var VResult = part[0].match(VRegExp);
        var _key = VResult[0];
        if (!_data[ _key ]) {
          _data[ _key ] = [];
        }
        _data[ _key ].push(part[ 1 ]);
      }else{
        if (part[0].indexOf('[') > -1) {
          var _key = part[0];
          var VResult = part[0].match(VRegExp);
          if (!_data[ VResult[0] ]) {
            _data[ VResult[0] ] = [];
          }
          if (!_data[ VResult[0] ][VResult[1]]) {
            _data[ VResult[0] ][VResult[1]] = [];
          }
          _data[ VResult[0] ][VResult[1]].push(decodeURIComponent(part[ 1 ]));
        }else{
          _data[ part[ 0 ] ] = decodeURIComponent(part[ 1 ]);
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
    phone = decodeURIComponent(phone);
  }

  var VRegExp = new RegExp(/[\d]/g);
  var VResult = phone.match(VRegExp);
  if (!VResult) {
    VResult = [];
  }

  return VResult.length;
}

function getDataAttrName(name, value) {
  var resultName = (value) ? name + '="'+value+'"' : name;

  return '[' + resultName + ']';
}

module.exports = {
  'parseSerialize': parseSerialize,
  'testRequire': testRequire,
  'getPhoneNumberLength': getPhoneNumberLength,
  'getDataAttrName': getDataAttrName,
  'getPageLink': getPageLink
}
