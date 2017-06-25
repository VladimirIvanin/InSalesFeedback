var getPageLink = require('./helpers').getPageLink;

/**
 * Преобразование контента
 */
function updateContentData(owner, formContent) {
  var result = $.Deferred();
  var content = formContent;

  content = getContentHtml(owner, content);

  if (owner.isPageProduct && owner.options.includeProductInfo) {
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

  if (!owner.isPageProduct || !owner.options.includeProductInfo) {
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

  productContent += getRow('Товар', product.title);

  if (product.sku) {
    productContent += getRow('Артикул', product.sku);
  }

  return content + productContent;
}

function getRow(key, value) {
  return '<div><strong>'+key+':</strong> '+value+'</div>';
}

function getContentHtml(owner, content) {
  var resultContent = content;
  
  return resultContent;
}

function updateContentTop(content, messageContent) {
  var _messageContent = '<br />' + messageContent + '<br />';
  return content + _messageContent;
}
function updateContentFooter(content) {
  var pageLink = '<br /> Отправлено со страницы: ' +  getPageLink();
  return content + pageLink;
}

module.exports = updateContentData;