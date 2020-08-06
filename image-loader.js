// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    return function from(arrayLike/*, mapFn, thisArg */) {
      var C = this;
      var items = Object(arrayLike);

      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback/*, thisArg*/) {

    var T, k;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    if (arguments.length > 1) {
      T = arguments[1];
    }

    k = 0;

    while (k < len) {

      var kValue;

      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}

function createImageLoader(settings) {
  var loadImageByUrl = function(target) {
    target.addEventListener("load", function() {
      target.style.opacity = 1;
    });
    target.setAttribute("src", target.getAttribute("data-src"));
  };

  var imageList = Array.from(document.querySelectorAll('img[loader=ready]'));
  imageList.forEach(function(element, index) {
    element.style.opacity = 0;
    element.style.transition = "opacity 0.5s ease-in-out";
    loadImageByUrl(element);
  });
  var lazyloader = createLazyloader();
  lazyloader();

  function throttle(fn, delay, atleast) {
    var timeout   = null,
        startTime = new Date();
    return function() {
      var curTime = new Date();
      clearTimeout(timeout);
      if (curTime - startTime >= atleast) {
          fn();
          startTime = curTime;
      } else {
          timeout = setTimeout(fn, delay);
      }
    }
  }
  function getOffset(el) {
    var box = el.getBoundingClientRect();
    return {
      top: box.top + window.pageYOffset - document.documentElement.clientTop,
      left: box.left + window.pageXOffset - document.documentElement.clientLeft
    };
  }
  function createLazyloader() {
    var lazyImageList = Array.from(document.querySelectorAll('img[loader=lazy]'));
    lazyImageList.forEach(function(element, index) {
      element.style.opacity = 0;
      element.style.transition = "opacity 0.5s ease-in-out";
    });

    return function() {
      var seeHeight = window.innerHeight;
      var scrollTop =
        (document.documentElement && document.documentElement.scrollTop) ||
        (document.body && document.body.scrollTop);

      lazyImageList = lazyImageList.filter(function(element, index) {
        var offsetTop = getOffset(element).top
        var hasVisible = offsetTop < seeHeight + scrollTop;
        if (hasVisible) {
          loadImageByUrl(element);
        }

        return !hasVisible;
      });
    }
  }

  if (window.addEventListener) {
    window.addEventListener('scroll', throttle(lazyloader, 500, 500), false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', throttle(lazyloader, 500, 500));
  }
}
