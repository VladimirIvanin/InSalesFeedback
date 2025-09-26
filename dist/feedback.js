/*!
 * InSalesFeedback v0.17.0
 * https://github.com/VladimirIvanin/InSalesFeedback
 * Vladimir Ivanin
 * 2025
 */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
var parseSerialize=require("./helpers").parseSerialize,getFailerrors=require("./helpers").getFailerrors,getDataAttrName=require("./helpers").getDataAttrName,checkAgree=require("./validate").checkAgree,system=require("../variables").system;function binding(){var e=this,s=e.options,n=e.$element,a=n.find(getDataAttrName(s.selectors.submit)),t=n.find(getDataAttrName(s.selectors.agree));function r(e){0===a.length&&(console.warn("Отсутствует кнопка отправления формы."),a=n.find('[type="submit"]')),e?(a.removeClass(s.classes.disabledButton).prop("disabled",!1).removeAttr("disabled","disabled"),t.removeClass(s.classes.errorAgree)):(a.addClass(s.classes.disabledButton).prop("disabled",!0).attr("disabled","disabled"),t.addClass(s.classes.errorAgree))}n.on("submit",function(s){e.eventMachine("before",n,{}),s.preventDefault();var a=e.options.selectors.agree,t=checkAgree(n,a,e.options.useAgree,e.options.errorMessages),r=parseSerialize(serialize(n.get(0))),o=e.options.customValidate;if(!t)return e.eventMachine("notagree",n,r),void e.eventMachine("after",n,r);o&&"function"==typeof o?o(n,r,e)?e.validateFormData(r).done(function(s){e.sendMessage(s).done(function(s){s.formData=r,e.eventMachine("success",n,s),e.eventMachine("after",n,r)}).fail(function(s){var a=getFailerrors(s);e.errorRender(a),e.eventMachine("fail",n,s),e.eventMachine("after",n,r)})}).fail(function(s){e.errorRender(s),e.eventMachine("error",n,s),e.eventMachine("after",n,r)}):(e.eventMachine("error",n,r),e.eventMachine("after",n,r)):e.validateFormData(r).done(function(s){e.sendMessage(s).done(function(s){s.formData=r,e.eventMachine("success",n,s),e.eventMachine("after",n,r)}).fail(function(s){var a=getFailerrors(s);e.errorRender(a),e.eventMachine("fail",n,s),e.eventMachine("after",n,r)})}).fail(function(s){e.errorRender(s),e.eventMachine("error",n,s),e.eventMachine("after",n,r)})}),t.click(function(a){var t=$(this).prop("checked");if(e.eventMachine("before",n,{}),t){var o=parseSerialize(n.serialize());e.eventMachine("agree",n,o),e.eventMachine("after",n,o),e.successRender(!0),r(!0)}else s.showMessageAgree&&e.errorRender([{name:"agree",errorMessage:e.options.errorMessages.agree}]),r(!1)}),$(document).on(system.events.success,function(s){e.UUID===s.InSalesFeedback.$target[0].InSalesFeedbackUUID&&(e.options.resetFormOnSubmit&&n.trigger("reset"),e.successRender())}),$(document).on(system.events.notagree,function(n){e.UUID===n.InSalesFeedback.$target[0].InSalesFeedbackUUID&&(s.showMessageAgree&&e.errorRender([{name:"agree",errorMessage:e.options.errorMessages.agree}]),r(!1))})}function serialize(e){if(e&&"FORM"===e.nodeName){var s,n,a=[];for(s=e.elements.length-1;s>=0;s-=1)if(""!==e.elements[s].name)switch(e.elements[s].nodeName){case"INPUT":switch(e.elements[s].type){case"text":case"tel":case"email":case"hidden":case"password":case"button":case"reset":case"submit":a.push(e.elements[s].name+"="+encodeURIComponent(e.elements[s].value));break;case"checkbox":case"radio":e.elements[s].checked&&a.push(e.elements[s].name+"="+encodeURIComponent(e.elements[s].value))}break;case"file":break;case"TEXTAREA":a.push(e.elements[s].name+"="+encodeURIComponent(e.elements[s].value));break;case"SELECT":switch(e.elements[s].type){case"select-one":a.push(e.elements[s].name+"="+encodeURIComponent(e.elements[s].value));break;case"select-multiple":for(n=e.elements[s].options.length-1;n>=0;n-=1)e.elements[s].options[n].selected&&a.push(e.elements[s].name+"="+encodeURIComponent(e.elements[s].options[n].value))}break;case"BUTTON":switch(e.elements[s].type){case"reset":case"submit":case"button":a.push(e.elements[s].name+"="+encodeURIComponent(e.elements[s].value))}}return a.join("&")}}module.exports=binding;
},{"../variables":11,"./helpers":4,"./validate":9}],3:[function(require,module,exports){
var system=require("../variables").system;function eventMachine(e,t,n){var i=getMethodName(e),s=getEventName(e),a={};a.$target=t,a[e]=n||{},"object"==typeof EventBus&&EventBus.publish&&EventBus.publish(s,a);var o=jQuery.Event(s);o.InSalesFeedback=a,$(document).trigger(o),this.options[i]&&"function"==typeof this.options[i]&&this.options[i](a)}function getEventName(e){return system.events[e]}function getMethodName(e){return"on"+capitalize(e)}var capitalize=function(e){return e.charAt(0).toUpperCase()+e.slice(1)};module.exports=eventMachine;
},{"../variables":11}],4:[function(require,module,exports){
function parseSerialize(e){if(""===e)return{};var t={},r=decodeURI(e).replace("?","").split("&"),n=new RegExp(/(([A-Za-z0-9])+)+/g);return $.each(r,function(e,r){if(""!==(r=(r=r.replace(/^feedback\[/g,"")).replace("]=","="))){(r=r.split("="))[1]=r[1].replace(/%(?!\d+)/g,"%25");var a,i=r[0].match(n),o=i[0];if(r[0].indexOf("[]")>-1)t[o]||(t[o]=[]),t[o].push(r[1]);else if(r[0].indexOf("[")>-1)o=r[0],t[i[0]]||(t[i[0]]=[]),t[i[0]][i[1]]||(t[i[0]][i[1]]=[]),"undefined"===(a=decodeURIComponent(r[1]))&&(a=""),t[i[0]][i[1]].push(a);else"undefined"===(a=decodeURIComponent(r[1]))&&(a=""),t[r[0]]=a}}),t}function getPageLink(){return'<a href="'+window.location.href+'">'+$("title").text()+"</a>"}function testRequire(e,t){return t.indexOf(e)>-1}function getPhoneNumberLength(e){e=e?decodeURIComponent(e.replace(/%(?!\d+)/g,"%25")):"";var t=new RegExp(/[\d]/g),r=e.match(t);return r||(r=[]),r.length}function emailTest(e){var t=e||"";return new RegExp(/.+@.+\..+/g).test(t)}function generateUUID(){var e=(new Date).getTime();return"xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g,function(t){var r=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"===t?r:3&r|8).toString(16)})}function getFailerrors(e){var t=[];return e.errors&&$.each(e.errors,function(e,r){var n="string"==typeof r?r:r[0];t.push({name:e,errorMessage:n||""})}),t}function getDataAttrName(e,t){return"["+(t?e+'="'+t+'"':e)+"]"}module.exports={parseSerialize:parseSerialize,testRequire:testRequire,generateUUID:generateUUID,emailTest:emailTest,getFailerrors:getFailerrors,getPhoneNumberLength:getPhoneNumberLength,getDataAttrName:getDataAttrName,getPageLink:getPageLink};
},{}],5:[function(require,module,exports){
var defaults=require("../variables").defaults,binding=require("./binding"),eventMachine=require("./eventMachine"),sendMessage=require("./sendMessage"),errorRender=require("./render").errorRender,successRender=require("./render").successRender,checkProduct=require("./validate").checkProduct,checkNameContent=require("./validate").checkNameContent,validateFormData=require("./validate").validateFormData,generateUUID=require("./helpers").generateUUID,Feedback=function(e,t){this.$element=$(e);var r=generateUUID();return this.UUID=r,this.$element[0].InSalesFeedbackUUID=r,this.options=$.extend(!0,{},defaults,t),this.initBinding=binding,this.sendMessage=sendMessage,this.eventMachine=eventMachine,this.validateFormData=validateFormData,this.errorRender=errorRender,this.successRender=successRender,this.initFeedback(),this};Feedback.prototype.initFeedback=function(e,t){this.isPageProduct=checkProduct(),this.initBinding(),this.options.useDefaultContent||checkNameContent(this.$element)},module.exports=Feedback;
},{"../variables":11,"./binding":2,"./eventMachine":3,"./helpers":4,"./render":6,"./sendMessage":7,"./validate":9}],6:[function(require,module,exports){
var getDataAttrName=require("./helpers").getDataAttrName,system=require("../variables").system;function errorRender(e){var s=this,t=s.options.useJqueryToggle,r=getDataAttrName(s.options.selectors.field)+":first",n=getDataAttrName(s.options.selectors.inputError),o=getDataAttrName(s.options.selectors.error),i=getDataAttrName(s.options.selectors.errors),a=s.options.classes.errorInput,l=s.options.classes.errorField;function d(e,r,n){e.removeClass(a),r.removeClass(l),renderWithOptions(n,"","",!1,t),renderWithOptions(s.$element.find(o),"","",!1,t),renderWithOptions(s.$element.find(i),"","",!1,t)}$.each(e,function(e,o){var i=s.$element.find('[name="'+o.name+'"]'),m=i.parents(r),c=m.find(n);i.addClass(a),m.addClass(l),renderWithOptions(c,o.errorMessage,"",!0,t),s.options.hideErrorOnFocus&&i.on("click",function(e){d(i,m,c)})});var m=[];if($.each(e,function(e,s){m.push(s.name)}),$.each(system.names,function(e,t){if(-1===m.indexOf(t)){var o=s.$element.find('[name="'+t+'"]'),i=o.parents(r);d(o,i,i.find(n))}}),e&&e.length){s.$element.addClass(s.options.classes.errorForm),renderWithOptions(s.$element.find(o),s.options.messages.error,"",!0,t);var c="";_.forEach(e,function(e){c+=e.errorMessage+"<br />"}),renderWithOptions(s.$element.find(i),c,"",!0,t)}}function successRender(e){var s=this.$element,t=this.options.useJqueryToggle,r=this.options.hideSuccessMessageTimer,n=this.options.classes.errorInput,o=this.options.classes.errorField,i=getDataAttrName(this.options.selectors.field),a=getDataAttrName(this.options.selectors.inputError),l=getDataAttrName(this.options.selectors.error),d=getDataAttrName(this.options.selectors.errors),m=getDataAttrName(this.options.selectors.success);(this.$element.find("[name]").removeClass(n),this.$element.find(i).removeClass(o),this.$element.removeClass(this.options.classes.errorForm),renderWithOptions(s.find(l),"","",!1,t),renderWithOptions(s.find(d),"","",!1,t),renderWithOptions(s.find(a),"","",!1,t),e)||renderWithOptions(s.find(m),this.options.messages.success,"",!0,t,r)}function renderWithOptions(e,s,t,r,n,o){s&&e.html(s),r?e.addClass(t):e.removeClass(t),n&&(r?e.show():e.hide()),o&&setTimeout(function(){e.removeClass(t),e.html(""),n&&e.hide()},o)}module.exports={errorRender:errorRender,successRender:successRender};
},{"../variables":11,"./helpers":4}],7:[function(require,module,exports){
var parseSerialize=require("./helpers").parseSerialize,FIELD_TRANSFORM_MAP={"yandex-smart-token":{sourceField:"yandex-smart-token",feedbackField:"feedback[yandex-smart-token]",topLevelField:"yandex-smart-token"},"smart-token":{sourceField:"smart-token",feedbackField:null,topLevelField:"yandex-smart-token"}};function transformFieldNames(e){var a={},r={},o="",s=null;for(o in e)e.hasOwnProperty(o)&&(a[o]=e[o]);for(o in e)e.hasOwnProperty(o)&&(s=FIELD_TRANSFORM_MAP[o])&&(s.feedbackField&&(a[s.feedbackField]=e[o]),s.topLevelField&&(r[s.topLevelField]=e[o]));return{feedback:a,specialFields:r}}function sendMessage(e){var a=$.Deferred(),r=parseSerialize(window.location.search).lang||"",o={},s={},n="";for(n in o=transformFieldNames(e),s={lang:r,feedback:o.feedback},o.specialFields)o.specialFields.hasOwnProperty(n)&&(s[n]=o.specialFields[n]);return Shop&&Shop.config&&Shop.config.config&&"google"===Shop.config.config.captcha_type&&(s["g-recaptcha-response"]=e["g-recaptcha-response"]),$.post("/client_account/feedback.json",$.param(s)).done(function(e){s&&"ok"===e.status?a.resolve(e):(e.message=s,a.reject(e))}),a.promise()}module.exports=sendMessage;
},{"./helpers":4}],8:[function(require,module,exports){
var getPageLink=require("./helpers").getPageLink,defaults=require("../variables").defaults;function updateContentData(t,e,n){var o=$.Deferred(),a=e||"";return a=getCustomContent(t,a),a=getContentHtml(t,a),t.isPageProduct&&t.options.includeProductInfo&&!n?$.ajax({url:window.location.pathname+".json",type:"GET",dataType:"json"}).done(function(e){e&&e.product?(t.options.messageContent&&(a=updateContentTop(a,t.options.messageContent)),a=getProductInfo(e.product,a),t.options.urlPageOnContent&&(a=updateContentFooter(a)),o.resolve(a)):(t.options.urlPageOnContent&&(a=updateContentFooter(a)),o.resolve(a))}).fail(function(){t.options.urlPageOnContent&&(a=updateContentFooter(a)),o.resolve(a)}):t.options.urlPageOnContent&&(a=updateContentFooter(a)),t.isPageProduct&&t.options.includeProductInfo&&!n||o.resolve(a),o.promise()}function getProductInfo(t,e){var n='<div><a href="'+t.url+'">';return t.first_image&&(n+='<img src="'+t.first_image.medium_url+'" />'),n+="</a></div>",n+=getRow(defaults.messages.product,t.title),t.sku&&(n+=getRow(defaults.messages.sku,t.sku)),e+n}function getRow(t,e){return $("<div>").append($("<div>").append($("<strong>",{text:e?t+": ":t})).append($("<span>",{text:e||""}))).html()}function getContentHtml(t,e){var n=e;return t.$element.find("["+t.options.selectors.html+"]").each(function(t,e){n+=$(e).html()}),n}function getCustomContent(t,e){var n=e;return t.$element.find("["+t.options.selectors.customContent+"]").each(function(e,o){var a=$(o).data(t.options.selectors.customContent.replace("data-","")),s=$(o).val(),r=!1;$.each(["select",'[type="text"]',"textarea","input"],function(t,e){$(o).is(e)&&(r=!0)}),s||r||(s=$(o).html()),""===s&&(s=defaults.messages.default_value),$(o).is('[type="radio"]')||$(o).is('[type="checkbox"]')?$(o).is(":checked")&&($(o).is("[value]")||(s="✓"),$(o).is("[data-hide-checkbox-value]")?n+=getRow(a,!1):n+=getRow(a,s)):n+=getRow(a,s)}),n}function updateContentTop(t,e){return t+("<br />"+e+"<br />")}function updateContentFooter(t){return t+("<br /> "+defaults.messages.send_from+": "+getPageLink())}module.exports=updateContentData;
},{"../variables":11,"./helpers":4}],9:[function(require,module,exports){
var system=require("../variables").system,updateContentData=require("./updateContentData"),testRequire=require("./helpers").testRequire,emailTest=require("./helpers").emailTest,getPhoneNumberLength=require("./helpers").getPhoneNumberLength,punycode=require("punycode");function checkDuplicateId(e){var r=!1,t=e.get(0);t.id&&($('[id="'+t.id+'"]').length>1&&(r=!0,console.warn("Внимание! Задвоенный идентификатор - #"+t.id+". Форма может некорректно отправляться.")));return r}function checkProduct(){return window.location.pathname.indexOf("/product/")>-1}function validateFormData(e){var r=this,t=$.Deferred(),a=[],o=r.options.require;(Shop.config.config.feedback_captcha_enabled||Shop.config.theme_settings.feedback_captcha_enabled)&&o.push("g-recaptcha-response");var n=e,s=testRequire("from",o),u=validateFrom(n.from,s,r.options.errorMessages.from);n.from=u.value,u.isError&&a.push({name:"from",errorMessage:u.errorMessage});var c=testRequire("phone",o),i=validatePhone(n.phone,c,r.options.phoneNumberLength,r.options.errorMessages.phone);n.phone=i.value,i.isError&&a.push({name:"phone",errorMessage:i.errorMessage});var l=testRequire("name",o),p=validateName(n.name,l,r.options.errorMessages.name);n.name=p.value,p.isError&&a.push({name:"name",errorMessage:p.errorMessage});var h=testRequire("subject",o),d=validateSubject(n.subject,h,r.options.errorMessages.subject);n.subject=d.value,d.isError&&a.push({name:"subject",errorMessage:d.errorMessage});h=testRequire("g-recaptcha-response",o),d=validateSubject(n.subject,h,r.options.errorMessages.subject);if(n.subject=d.value,d.isError&&a.push({name:"g-recaptcha-response",errorMessage:d.errorMessage}),r.options.useDefaultContent||n.content)updateContentData(r,n.content,a.length>0).done(function(e){n.content=e;var o=validateContent(n.content,!r.options.useDefaultContent);n.content=o.value,o.isError&&a.push({name:"content",errorMessage:o.errorMessage}),a.length>0?t.reject(a):t.resolve(n)});else{var g=validateContent(n.content,!r.options.useDefaultContent,r.options.errorMessages.content);n.content=g.value,g.isError&&a.push({name:"content",errorMessage:g.errorMessage}),a.length>0?t.reject(a):t.resolve(n)}return t.promise()}function validatePhone(e,r,t,a){e||(e="");var o={isError:!1,errorMessage:a,value:decodeURIComponent(e.replace(/%(?!\d+)/g,"%25"))};(e=decodeURIComponent(e.replace(/%(?!\d+)/g,"%25")),!r&&e&&""==e||!r&&!e)?o.value=system.dataDefault.phone:r&&(e&&""!=e?t>getPhoneNumberLength(e)&&(o.isError=!0):o.isError=!0);return o}function validateFrom(e,r,t){e||(e="");var a={isError:!1,errorMessage:t,value:e};if(!r&&e&&""==e||!r&&!e){var o=window.location.host.replace(/^www\./g,"");-1==o.indexOf(".")&&(o="myinsales.ru"),a.value="shop@"+punycode.toUnicode(o)}else e&&""!=e&&emailTest(e)||(a.isError=!0);return a}function validateName(e,r,t){e||(e="");var a={isError:!1,errorMessage:t,value:e};return!r&&e&&""==e||!r&&!e?a.value=system.dataDefault.name:e&&""!=e||(a.isError=!0),a}function validateSubject(e,r,t){e||(e="");var a={isError:!1,errorMessage:t,value:e};return!r&&e&&""==e||!r&&!e?a.value=system.dataDefault.subject:e&&""!=e||(a.isError=!0),a}function validateContent(e,r,t){var a={isError:!1,errorMessage:t,value:e},o=e.trim();return e&&""!=o?(!r&&e&&""==o||!r&&!e)&&(a.value=system.dataDefault.content):(a.isError=!0,a.value=""),a}function checkNameContent(e){0==e.find('[name="content"]').length&&console.warn("В форме отсутствует поле content",e)}function checkAgree(e,r,t,a){var o=!0;if(t){var n=e.find("["+r+"]");0!=n.length&&n.prop("checked")||(o=!1),0==n.length&&console.warn("Отсутствует чекбокс согласия на обработку персональных данных")}return o}module.exports={checkDuplicateId:checkDuplicateId,checkProduct:checkProduct,checkAgree:checkAgree,checkNameContent:checkNameContent,validateFormData:validateFormData};
},{"../variables":11,"./helpers":4,"./updateContentData":8,"punycode":1}],10:[function(require,module,exports){
var Feedback=require("feedback"),system=require("variables").system,checkDuplicateId=require("./feedback/validate").checkDuplicateId;!function(e,a,t){var n=e.fn.InSalesFeedback;e.fn.InSalesFeedback=function(a){return this.each(function(t){var n=e(this),c="object"==typeof a&&a,s=n.data(system.NAME);(s||"destroy"!==a)&&(s||n.data(system.NAME,s=new Feedback(n,c)),"string"==typeof a&&s[a]())})},e.fn.InSalesFeedback.defaults=require("variables").defaults,e.fn.InSalesFeedback.noConflict=function(){return e.fn.InSalesFeedback=n,this}}(jQuery,window);
},{"./feedback/validate":9,"feedback":5,"variables":11}],11:[function(require,module,exports){
var defaults={useAgree:!1,showMessageAgree:!1,includeProductInfo:!0,messageContent:null,urlPageOnContent:!0,useJqueryToggle:!0,hideSuccessMessageTimer:5e3,hideErrorOnFocus:!0,resetFormOnSubmit:!0,useDefaultContent:!0,phoneNumberLength:11,require:[],onSuccess:function(){},onFail:function(){},onError:function(){},onBefore:function(){},onAfter:function(){},onAgree:function(){},onNotagree:function(){},customValidate:null,classes:{errorInput:"is-error-feedback-input",errorField:"is-error-feedback-field",errorForm:"is-error-feedback",errorAgree:"is-error-agree-feedback",disabledButton:"is-disabled-feedback",failForm:"is-fail-feedback"},errorMessages:{from:"Поле e-mail имеет неверное значение",phone:"Укажите номер в международном формате",name:"Не заполнено поле имя",subject:"Не заполнено поле тема сообщения",agree:"Необходимо принять условия передачи информации",content:"Не заполнено поле текст сообщения"},messages:{send_from:"Отправлено со страницы",product:"Продукт",sku:"Артикул",default_value:"Не заполнено",success:"Сообщение успешно отправлено!",fail:"Сообщение не отправлено, попробуйте ещё раз!",error:"Неверно заполнены поля!"},selectors:{html:"data-feedback-html",customContent:"data-feedback-custom-content",submit:"data-feedback-submit",agree:"data-feedback-agree",field:"data-feedback-field",input:"data-feedback-input",inputError:"data-feedback-input-error",success:"data-feedback-success",error:"data-feedback-error",errors:"data-feedback-errors"}},system={NAME:"InSalesFeedback",VERSION:"0.14.2",NAMESPACE:".InSalesFeedback",names:{from:"from",name:"name",phone:"phone",subject:"subject","g-recaptcha-response":"g-recaptcha-response",content:"content"},dataDefault:{from:"shop@myinsales.ru",name:"",phone:"",subject:"Заказ обратного звонка.",content:"Заказ обратного звонка."},events:{before:"before::feedback",after:"after::feedback",success:"success::feedback",fail:"fail::feedback",agree:"agree::feedback",notagree:"notagree::feedback",error:"error::feedback"}};module.exports={defaults:defaults,system:system};
},{}]},{},[10]);
