var getPageLink = require('./helpers').getPageLink;
var defaults = require('../variables').defaults;

/**
 * Преобразование контента
 */
function updateContentData(owner, formContent, isError) {
  var result = $.Deferred();
  var content = formContent || '';

  content = getCustomContent(owner, content);
  content = getContentHtml(owner, content);

  if (owner.isPageProduct && owner.options.includeProductInfo && !isError) {
    $.ajax({
      url: window.location.pathname + '.json',
      type: 'GET',
      dataType: 'json'
    })
    .done(function(success) {
      if (success && success.product) {
        if (owner.options.messageContent) {
          content = updateContentTop(content, owner.options.messageContent);
        }
        content = getProductInfo(success.product, content);
        if (owner.options.urlPageOnContent) {
          content = updateContentFooter(content);
        }
        result.resolve(content);
      }else{
        if (owner.options.urlPageOnContent) {
          content = updateContentFooter(content);
        }
        result.resolve(content);
      }
    })
    .fail(function() {
      if (owner.options.urlPageOnContent) {
        content = updateContentFooter(content);
      }
      result.resolve(content);
    })

  }else{
    if (owner.options.urlPageOnContent) {
      content = updateContentFooter(content);
    }
  }

  if (!owner.isPageProduct || !owner.options.includeProductInfo || isError) {
    result.resolve(content);
  }

  return result.promise();
}

function getProductInfo(product, content) {
  var productContent = '<div><a href="'+product.url+'">'
  if (product.first_image) {
    productContent += '<img src="'+product.first_image.medium_url+'" />';
  }
  productContent += '</a></div>';

  productContent += getRow(defaults.messages.product, product.title);

  if (product.sku) {
    productContent += getRow(defaults.messages.sku, product.sku);
  }

  return content + productContent;
}

function getRow(key, value) {
  return $('<div>').append(
            $('<div>')
            .append($('<strong>', {
              text: (value) ? key+': ' : key
            }))
            .append($('<span>', {
              text: (value) ? value : ''
            }))
          ).html();
}

function getContentHtml(owner, content) {
  var resultContent = content;
  var $html = owner.$element.find( '['+owner.options.selectors.html+']' );
  $html.each(function(index, el) {
    resultContent += $(el).html();
  });
  return resultContent;
}

function getCustomContent(owner, content) {
  var resultContent = content;
  var $customContent = owner.$element.find( '['+owner.options.selectors.customContent+']' );
  $customContent.each(function(index, el) {
    var key = $(el).data( owner.options.selectors.customContent.replace('data-', '') );
    var value = $(el).val();
    if (!value) {
      value = $(el).html();
    }
    if (value === '') {
      value = defaults.messages.default_value;
    }

    if ($(el).is('[type="radio"]') || $(el).is('[type="checkbox"]')) {
      if ($(el).is(':checked')) {
        if(!$(el).is('[value]')) {
          value = '✓';
        }
        // data-hide-key - запишет строку без значения и двоеточия
        if ($(el).is('[data-hide-checkbox-value]')) {
          resultContent += getRow(key, false);
        }else{
          resultContent += getRow(key, value);
        }
      }
    }else{
      resultContent += getRow(key, value);
    }

  });
  return resultContent;
}

function updateContentTop(content, messageContent) {
  var _messageContent = '<br />' + messageContent + '<br />';
  return content + _messageContent;
}
function updateContentFooter(content) {
  var pageLink = '<br /> '+defaults.messages.send_from+': ' +  getPageLink();
  return content + pageLink;
}

module.exports = updateContentData;
