(function(global) {
  /* jshint validthis: true */
  'use strict';

  function blocker(promise, func) {
    return function() {
      return ShittyCatActions._promise === promise ? func() : Promise.reject();
    };
  }

  function wait(t) {
    return new Promise(function(resolve) {
      setTimeout(resolve, t);
    });
  }

  function look(position, t) {
    t = t === undefined ? 200 : t;
    var r = this.options.outer.R;
    if (typeof position === 'object') {
      return Promise.all([
        this.components.leftEye.move(position.x, position.y, t),
        this.components.rightEye.move(position.x, position.y, t)
      ]);
    } else if (position === 'L') {
      return look.call(this, { x: -r, y: 0 }, t);
    } else if (position === 'R') {
      return look.call(this, { x: r, y: 0 }, t);
    } else if (position === 'T') {
      return look.call(this, { x: 0, y: -r }, t);
    } else if (position === 'B') {
      return look.call(this, { x: 0, y: r }, t);
    } else if (position === 'TL') {
      return look.call(this, { x: -r, y: -r }, t);
    } else if (position === 'TR') {
      return look.call(this, { x: r, y: -r }, t);
    } else if (position === 'BL') {
      return look.call(this, { x: -r, y: r }, t);
    } else if (position === 'BR') {
      return look.call(this, { x: r, y: r }, t);
    } else {
      return look.call(this, { x: 0, y: 0 }, t);
    }
  }

  function lookAround() {
    var self = this;
    var t = 800;
    var r = this.options.outer.R;
    var dir = Math.random() > 0.5 ? 1 : -1;
    look.call(this, { x: r * 0.4 * dir, y: 0 }, t / 2)
      .then(function() {
        return look.call(self, { x: -r * 0.4 * dir, y: 0 }, t);
      })
      .then(function() {
        return wait(t);
      })
      .then(function() {
        return look.call(self, 'M', t);
      });
  }

  function blink(name) {
    var t = 100;
    var tp = 0.85, bp = 0.2;
    if (name === 'left' || name === 'right') {
      var eye = this.components[name + 'Eye'];
      return eye.moveEyelids(tp, bp, t)
        .then(function() {
          return eye.resetMoveEyelids.call(eye, t);
        });
    }
    return Promise.all([
      blink.call(this, 'left'),
      blink.call(this, 'right')
    ]);
  }

  function spin(times) {
    times = times || 2;

    var self = this;
    var t = 400;
    var eye = this.components.leftEye;
    var spinPath = eye.components.spinPath;
    var length = spinPath.getTotalLength();
    var center = ShittyCatUtils.getCenter(this.components.leftEye.svg.node);
    var promise = look.call(this, 'L');

    while (times--) {
      promise = promise.then(_spin);
    }
    return promise.then(function() {
      return look.call(self, 'M', t);
    });

    function _spin() {
      return Snap.animatePromise(0, length, function setter(value) {
        var point = spinPath.getPointAtLength(value);
        var ratio = ShittyCatUtils.getInnerRatio(self.options);
        var ix = (point.x - center.x) * ratio + center.x;
        var iy = (point.y - center.y) * ratio + center.y;
        var matrix = new Snap.Matrix().translate(point.x - center.x, point.y - center.y);
        self.components.leftEye.components.inner.attr({ cx: ix, cy: iy });
        self.components.leftEye.components.pupil.attr({ cx: point.x, cy: point.y });
        self.components.leftEye.components.reflections.transform(matrix);
        self.components.rightEye.components.inner.attr({ cx: ix, cy: iy });
        self.components.rightEye.components.pupil.attr({ cx: point.x, cy: point.y });
        self.components.rightEye.components.reflections.transform(matrix);
      }, t);
    }
  }

  function close() {
    var t = 200;
    var tp = 0.85, bp = 0.2;
    return Promise.all([
      this.components.leftEye.moveEyelids(tp, bp, t),
      this.components.rightEye.moveEyelids(tp, bp, t)
    ]);
  }

  function open() {
    var t = 200;
    return Promise.all([
      this.components.leftEye.moveEyelids(0, 0, t),
      this.components.rightEye.moveEyelids(0, 0, t)
    ]);
  }

  function stop(t) {
    t = t === undefined ? 200 : t;
    ShittyCatActions._promise = null;
    var self = this;
    var eyeNames = ['leftEye', 'rightEye'];
    var componentNames = [
      'pupil',
      'inner',
      'reflections',
      'eyelidTop',
      'eyelidBottom',
      'loadingBg',
      'loadingCircle'
    ];
    var promises = [];
    eyeNames.forEach(function(eName) {
      var eye = self.components[eName];
      componentNames.forEach(function(cName) {
        var component = eye.components[cName];
        component.stop();
        component.attr({ class: '' });
      });
      promises = promises.concat([
        eye.resetMove(t),
        eye.resetScalePupil(t),
        eye.resetMoveEyelids(t),
        eye.resetRotateEyelids(t)
      ]);
    });
    return Promise.all(promises);
  }

  function normal() {
    var self = this;
    var promise = ShittyCatActions._promise = stop.call(this).then(_normal);
    return promise;

    function _normal() {
      return wait(Math.randomInt(4000, 7000))
        .then(blocker(promise, function() {
          return Math.random() > 0.6 ?
            blink.call(self).then(function() { blink.call(self); }) :
            blink.call(self);
        }))
        .then(blocker(promise, _normal)) // looping
        .catch(function(e) { if (e) throw e; });
    }
  }

  function angry() {
    var self = this;
    var t = 200;
    var promise = ShittyCatActions._promise = stop.call(this).then(_angry);
    self.components.leftEye.components.pupil.addClass('cat-shake');
    self.components.rightEye.components.pupil.addClass('cat-shake');
    return promise;

    function _angry() {
      return Promise.all([
        self.components.leftEye.moveEyelids(0.5, 0, t),
        self.components.leftEye.rotateEyelid('top', 20, t),
        self.components.leftEye.scalePupil(0.5, 1, t),
        self.components.rightEye.moveEyelids(0.5, 0, t),
        self.components.rightEye.rotateEyelid('top', -20, t),
        self.components.rightEye.scalePupil(0.5, 1, t)
      ]);
    }
  }

  function sad() {
    var self = this;
    var t = 200;
    var promise = ShittyCatActions._promise = stop.call(this).then(_sad);
    self.components.leftEye.components.reflections.addClass('cat-shake');
    self.components.rightEye.components.reflections.addClass('cat-shake');
    return promise;

    function _sad() {
      return Promise.all([
        self.components.leftEye.moveEyelids(0.5, 0, t),
        self.components.leftEye.rotateEyelid('top', -15, t),
        self.components.leftEye.scalePupil(1.2, 1.2, t),
        self.components.rightEye.moveEyelids(0.5, 0, t),
        self.components.rightEye.rotateEyelid('top', 15, t),
        self.components.rightEye.scalePupil(1.2, 1.2, t)
      ]);
    }
  }

  function happy() {
    var self = this;
    var t = 200;
    var promise = ShittyCatActions._promise = stop.call(this).then(_happy);
    return promise;

    function _happy() {
      return Promise.all([
        self.components.leftEye.moveEyelids(0, 0.55, t),
        self.components.leftEye.scalePupil(0.8, 0.8, t),
        self.components.rightEye.moveEyelids(0, 0.55, t),
        self.components.rightEye.scalePupil(0.8, 0.8, t)
      ])
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.scalePupil(1.2, 1.2, t),
            self.components.rightEye.scalePupil(1.2, 1.2, t)
          ]);
        }))
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.move(10, 0, t),
            self.components.rightEye.move(10, 0, t)
          ]);
        }))
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.move(-10, 0, t),
            self.components.rightEye.move(-10, 0, t),
            self.components.leftEye.moveEyelids(0, 0.5, t),
            self.components.rightEye.moveEyelids(0, 0.5, t)
          ]);
        }))
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.resetMove(t),
            self.components.rightEye.resetMove(t),
            self.components.leftEye.moveEyelids(0, 0.55, t),
            self.components.rightEye.moveEyelids(0, 0.55, t)
          ]);
        }))
        .catch(function(e) { if (e) throw e; });
    }
  }

  function sleepy() {
    var self = this;
    var t = [5000, 400, 3000, 1000];
    var promise = ShittyCatActions._promise = stop.call(this).then(_sleepy);
    return promise;

    function _sleepy() {
      return Promise.all([
        self.components.leftEye.moveEyelids(0.65, 0.3, t[0], mina.elastic),
        self.components.rightEye.moveEyelids(0.65, 0.3, t[0], mina.elastic)
      ])
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.moveEyelids(0.3, 0.2, t[1], mina.easein),
            self.components.rightEye.moveEyelids(0.3, 0.2, t[1], mina.easein)
          ]);
        }))
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.moveEyelids(0.55, 0.3, t[2], mina.easein),
            self.components.rightEye.moveEyelids(0.55, 0.3, t[2], mina.easein)
          ]);
        }))
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.moveEyelids(0.2, 0.2,  t[3], mina.easein),
            self.components.rightEye.moveEyelids(0.2, 0.2, t[3], mina.easein)
          ]);
        }))
        .then(blocker(promise, _sleepy))
        .catch(function(e) { if (e) throw e; });
    }
  }

  function wake() {
    var self = this;
    var t = [200, 1200, 500];
    var promise = ShittyCatActions._promise = stop.call(this).then(_wake);
    self.components.leftEye.components.reflections.addClass('cat-shake');
    self.components.rightEye.components.reflections.addClass('cat-shake');
    return promise;

    function _wake() {
      return Promise.all([
        self.components.leftEye.scalePupil(0.7, 0.7, t[0]),
        self.components.rightEye.scalePupil(0.7, 0.7, t[0])
      ])
        .then(blocker(promise, function() {
          return wait(t[1]);
        }))
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.scalePupil(1, 1, t[2]),
            self.components.rightEye.scalePupil(1, 1, t[2])
          ]);
        }))
        .then(blocker(promise, function() {
          return normal.call(self);
        }))
        .catch(function(e) { if (e) throw e; });
    }
  }

  function search() {
    var self = this;
    var t = [200, 400, 300, 200];
    var promise = ShittyCatActions._promise = stop.call(this).then(_search);
    self.components.leftEye.components.loadingBg.addClass('cat-search-bg');
    self.components.leftEye.components.loadingCircle.addClass('cat-search-circle');
    self.components.rightEye.components.loadingBg.addClass('cat-search-bg');
    self.components.rightEye.components.loadingCircle.addClass('cat-search-circle');
    return promise;

    function _search() {
      return Promise.all([
        self.components.leftEye.moveEyelids(0.2, 0.2, t[0]),
        self.components.rightEye.moveEyelids(0.2, 0.2, t[0])
      ])
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.moveEyelids(0.18, 0.16, t[1]),
            self.components.rightEye.moveEyelids(0.18, 0.16, t[1])
          ]);
        }))
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.moveEyelids(0.19, 0.18, t[2]),
            self.components.rightEye.moveEyelids(0.19, 0.18, t[2])
          ]);
        }))
        .then(blocker(promise, function() {
          return Promise.all([
            self.components.leftEye.moveEyelids(0.18, 0.175, t[3]),
            self.components.rightEye.moveEyelids(0.18, 0.175, t[3])
          ]);
        }))
        .then(blocker(promise, _search))
        .catch(function(e) { if (e) throw e; });
    }
  }

  var ShittyCatActions = {
    _promise: null,

    wait: wait,
    look: look,
    lookAround: lookAround,
    blink: blink,
    spin: spin,
    close: close,
    open: open,

    stop: stop,
    normal: normal,
    angry: angry,
    sad: sad,
    happy: happy,
    sleepy: sleepy,
    wake: wake,
    search: search,
  };

  global.ShittyCatActions = ShittyCatActions;
})(this);
