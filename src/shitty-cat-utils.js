(function(global) {
  'use strict';

  // Extend Math
  Math.fit = function(n, range) {
    if (range[0] !== undefined) { n = Math.max(range[0], n); }
    if (range[1] !== undefined) { n = Math.min(range[1], n); }
    return n;
  };
  Math.randomInt = function(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  };

  // Extend Snap
  Snap.plugin(function (Snap, Element, Paper, global) {
    Paper.prototype.circlePath = function(cx, cy, r) {
      var self = this;
      var p = 'M' + cx + ',' + cy;
      p += 'm' + -r + ',0';
      p += 'a' + r + ',' + r + ' 0 0,1 ' + (r * 2) +',0';
      p += 'a' + r + ',' + r + ' 0 0,1 ' + -(r * 2) + ',0';
      return self.path(p, cx, cy);
    };
    Element.prototype.animatePromise = function(attrs, duration, easing) {
      var self = this;
      duration = duration === undefined ? 0 : duration;
      easing = easing === undefined ? mina.linear : easing;
      return new Promise(function(resolve, reject) {
        self.animate(attrs, duration, easing, resolve);
      });
    };
    Snap.animatePromise = function(from, to, setter, duration, easing) {
      duration = duration === undefined ? 0 : duration;
      easing = easing === undefined ? mina.linear : easing;
      return new Promise(function(resolve, reject) {
        Snap.animate(from, to, setter, duration, easing, resolve);
      });
    };
  });

  /**
   * Utils
   */
  var Utils = {
    getCenter: function(element) {
      return {
        x: element.clientWidth / 2,
        y: element.clientHeight / 2
      };
    },
    getDistance: function(x, y, x0, y0) {
      x0 = x0 === undefined ? 0 : x0;
      y0 = y0 === undefined ? 0 : y0;
      x -= x0;
      y -= y0;
      return Math.pow(x * x + y * y, 0.5);
    },
    getInnerRatio: function(options) {
      var innerDistance = (options.outer.R - options.inner.R);
      var pupilDistance = (options.outer.R - options.pupil.R);
      return  innerDistance / pupilDistance;
    }
  };

  global.ShittyCatUtils = Utils;

})(this);