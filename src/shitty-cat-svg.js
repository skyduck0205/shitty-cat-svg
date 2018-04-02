(function(global) {
  'use strict';

  /**
   * Config for initializing the eyes components.
   * @type {Object}
   * @property {string} faceId - DOM id of the left eye
   * @property {string} color - main color of the face
   * @property {object} outer - outer part config
   * @property {number} outer.R - radius of outer part of eyes
   * @property {string} outer.fill - color of outer part in hex/rgb
   * @property {string} outer.stroke - color of outer part stroke in hex/rgb
   * @property {number} outer.strokeWidth - stroke width of outer part
   * @property {object} inner - inner part config
   * @property {number} inner.R - radius of inner part of eyes
   * @property {string} inner.color - color of inner part in hex/rgb
   * @property {object} pupil - pupil part config
   * @property {number} pupil.R - radius of pupil of eyes
   * @property {string} pupil.color - color of pupil in hex/rgb
   * @property {number} noseWidth - width of nose
   */
  var DEFAULT_OPTIONS = {
    id: 'shitty-cat',
    color: '#000',
    distance: 180,
    outer: {
      R: 120,
      fill: '#FFF',
      stroke: '#666',
      strokeWidth: 6
    },
    inner: {
      R: 100,
      color: '#FB6:70-#F72'
    },
    pupil: {
      R: 70,
      color: '#000'
    },
    faceWidth: 1000,
    noseWidth: 80
  };

  /**
   * Controller Component
   */
  function EyesController() {
    var self = this;
    this.components = {
      leftEye: null,
      rightEye: null,
      mouth: null
    };
    this.options = _.cloneDeep(DEFAULT_OPTIONS);
    this.actions = {};

    this.init = init;
    this.draw = draw;
    this.loadActions = loadActions;
    this.miniMode = miniMode;
    this.destroy = destroy;

    /**
     * Public methods
     */
    function init(options) {
      _.merge(self.options, _.cloneDeep(options));
      self.draw();
      if (ShittyCatActions) {
        self.loadActions(ShittyCatActions);
      }
    }

    function draw() {
      var parentDOM = document.getElementById(self.options.id);
      parentDOM.classList.add('shitty-cat');
      parentDOM.style.backgroundColor = self.options.color;
      parentDOM.style.textAlign = 'center';

      var eyesDOM = document.createElement('div');
      parentDOM.appendChild(eyesDOM);

      var size = (self.options.outer.R) * 2 + self.options.outer.strokeWidth;
      Snap(size, size).attr({ class: 'cat-eye-left' }).appendTo(eyesDOM);
      Snap(size, size).attr({ class: 'cat-eye-right' }).appendTo(eyesDOM).node.style.marginLeft = self.options.distance;
      Snap(self.options.faceWidth, 180).attr({ class: 'cat-mouth' }).appendTo(parentDOM);

      self.components.leftEye = new Eye('#' + self.options.id + ' .cat-eye-left', self.options);
      self.components.rightEye = new Eye('#' + self.options.id + ' .cat-eye-right', self.options);
      self.components.mouth = new Mouth('#' + self.options.id + ' .cat-mouth', self.options);
    }

    function loadActions(actions) {
      Object.getOwnPropertyNames(actions).forEach(function(name) {
        if (typeof actions[name] === 'function') {
          self.actions[name] = actions[name].bind(self);
        }
      });
    }

    function miniMode(mini, r) {
      r = r || 60;
      var ratio = r / self.options.outer.R;
      var parentDOM = document.getElementById(self.options.id);
      if (mini) {
        parentDOM.classList.add('cat-mini');
        parentDOM.style.height = r * 2 + self.options.outer.strokeWidth * ratio + 'px';
        self.components.rightEye.svg.node.style.marginLeft = self.options.distance * ratio;

        self.components.leftEye.svg.transform(new Snap.Matrix().scale(ratio));
        self.components.rightEye.svg.transform(new Snap.Matrix().scale(ratio));
        self.components.mouth.svg.transform(new Snap.Matrix().scale(1, ratio));
      } else {
        parentDOM.classList.remove('cat-mini');
        parentDOM.style.height = '';
        self.components.rightEye.svg.node.style.marginLeft = self.options.distance;

        self.components.leftEye.svg.transform(new Snap.Matrix().scale(1));
        self.components.rightEye.svg.transform(new Snap.Matrix().scale(1));
        self.components.mouth.svg.transform(new Snap.Matrix().scale(1, 1));
      }
    }

    function destroy() {
      var parentDOM = document.getElementById(self.options.id);
      parentDOM.innerHTML = '';
    }
  }

  /**
   * Eye Component
   */
  function Eye(selector, options) {
    var self = this;
    this.svg = Snap(selector);
    this.components = {
      outer: null,
      inner: null,
      pupil: null,
      reflections: null,
      loadingBg: null,
      loadingCircle: null,
      eyelidTop: null,
      eyelidBottom: null,
      spinPath: null
    };

    this.init = init;
    this.draw = draw;
    this.stop = stop;
    this.move = move;
    this.resetMove = resetMove;
    this.moveInner = moveInner;
    this.movePupil = movePupil;
    this.scalePupil = scalePupil;
    this.resetScalePupil = resetScalePupil;
    this.moveEyelid = moveEyelid;
    this.moveEyelids = moveEyelids;
    this.resetMoveEyelids = resetMoveEyelids;
    this.rotateEyelid = rotateEyelid;
    this.resetRotateEyelids = resetRotateEyelids;

    this.init();

    /**
     * Public methods
     */
    function init() {
      self.draw();
    }

    function draw() {
      var center = ShittyCatUtils.getCenter(self.svg.node);

      self.components.outer = self.svg
        .circle(center.x, center.y, options.outer.R)
        .attr({
          fill: options.outer.fill,
          stroke: options.outer.stroke,
          strokeWidth: options.outer.strokeWidth
        });

      self.components.inner = self.svg
        .circle(center.x, center.y, options.inner.R)
        .attr({ fill: 'r(0.5,0.5,0.5)' + options.inner.color });

      self.components.pupil = self.svg
        .ellipse(center.x, center.y, options.pupil.R, options.pupil.R)
        .attr({ fill: options.pupil.color });

      self.components.reflections = self.svg
        .g(
          self.svg
            .circle(center.x + options.pupil.R / 2, center.y - options.pupil.R / 2 - 10, 25)
            .attr({ fill: '#FFF', fillOpacity: 0.9 }),
          self.svg
            .circle(center.x - options.pupil.R / 2, center.y + options.pupil.R / 2 + 15, 15)
            .attr({ fill: '#FFF', fillOpacity: 0.9 })
        );

      self.components.loadingBg = self.svg
        .circle(center.x, center.y, 25)
        .attr({
          stroke: 'rgba(120,220,170,.2)',
          strokeWidth: '0',
          fill: 'none',
          strokeDasharray: 156,
          strokeDashoffset: '0',
          strokeLinecap: 'round'
        });

      self.components.loadingCircle = self.svg
        .circle(center.x, center.y, 25)
        .attr({
          stroke: '#FFF',
          strokeWidth: '0',
          fill: 'none',
          strokeDasharray: '104,156',
          strokeLinecap: 'round',
          strokeDashoffset: '-52'
        });

      var insideClip = self.svg.circle(center.x, center.y, options.outer.R - 5);
      var insideGroup = self.svg
        .g(
          self.components.inner,
          self.components.pupil,
          self.components.reflections,
          self.components.loadingBg,
          self.components.loadingCircle
        )
        .attr({ clip: insideClip });

      self.components.eyelidTop = self.svg
        .path(_getEyelidPathString('top', 0))
        .attr({ fill: options.color });

      self.components.eyelidBottom = self.svg
        .path(_getEyelidPathString('bottom', 0))
        .attr({ fill: options.color });

      self.components.spinPath = self.svg
        .circlePath(center.x, center.y, options.outer.R * 0.8)
        .toDefs();
    }

    function move(x, y, duration, easing) {
      var ratio = ShittyCatUtils.getInnerRatio(options);
      return Promise.all([
        self.moveInner(x * ratio, y * ratio, duration, easing),
        self.movePupil(x, y, duration, easing)
      ]);
    }

    function resetMove(duration, easing) {
      return self.move(0, 0, duration, easing);
    }

    function moveInner(x, y, duration, easing) {
      var center = ShittyCatUtils.getCenter(self.svg.node);
      var ratio = ShittyCatUtils.getInnerRatio(options);
      var dist = ShittyCatUtils.getDistance(x, y);
      if (dist !== 0 && dist > options.outer.R - options.inner.R) {
        x = (x * (options.outer.R - options.inner.R) / dist);
        y = (y * (options.outer.R - options.inner.R) / dist);
      }
      var cx = x + center.x;
      var cy = y + center.y;
      return self.components.inner.animatePromise({ cx: cx, cy: cy }, duration, easing);
    }

    function movePupil(x, y, duration, easing) {
      var center = ShittyCatUtils.getCenter(self.svg.node);
      var dist = ShittyCatUtils.getDistance(x, y);
      if (dist !== 0 && dist > options.outer.R - options.pupil.R) {
        x = (x * (options.outer.R - options.pupil.R) / dist);
        y = (y * (options.outer.R - options.pupil.R) / dist);
      }
      var cx = x + center.x;
      var cy = y + center.y;
      // var matrix = new Snap.Matrix().translate(x * 0.9, y * 0.9);
      var matrix = new Snap.Matrix().translate(x, y);
      return Promise.all([
        self.components.pupil.animatePromise({ cx: cx, cy: cy }, duration, easing),
        self.components.reflections.animatePromise({ transform: matrix }, duration, easing)
      ]);
    }

    function scalePupil(x, y, duration, easing) {
      return self.components.pupil.animatePromise({
        rx: options.pupil.R * x,
        ry: options.pupil.R * y
      }, duration, easing);
    }

    function resetScalePupil(duration, easing) {
      return self.scalePupil(1, 1, duration, easing);
    }

    function moveEyelid(name, percentage, duration, easing) {
      percentage = Math.fit(percentage, [0, 1]);
      var eyelid = name === 'top' ? self.components.eyelidTop : self.components.eyelidBottom;
      var pathString = _getEyelidPathString(name, percentage);
      return eyelid.animatePromise({ d: pathString }, duration, easing);
    }

    function moveEyelids(topPercentage, bottomPercentage, duration, easing) {
      return Promise.all([
        self.moveEyelid('top', topPercentage, duration, easing),
        self.moveEyelid('bottom', bottomPercentage, duration, easing)
      ]);
    }

    function resetMoveEyelids(duration, easing) {
      return self.moveEyelids(0, 0, duration, easing);
    }

    function rotateEyelid(name, deg, duration, easing) {
      var center = ShittyCatUtils.getCenter(self.svg.node);
      var matrix = new Snap.Matrix().rotate(deg, center.x, center.y);
      var eyelid = name === 'top' ? self.components.eyelidTop : self.components.eyelidBottom;
      return eyelid.animatePromise({ transform: matrix }, duration, easing);
    }

    function resetRotateEyelids(duration, easing) {
      return Promise.all([
        self.rotateEyelid('top', 0, duration, easing),
        self.rotateEyelid('bottom', 0, duration, easing)
      ]);
    }

    /**
     * Private methods
     */
    function _getEyelidPathString(name, percentage) {
      var center = ShittyCatUtils.getCenter(self.svg.node);
      var r = options.outer.R + options.outer.strokeWidth / 2 + 8;
      var ry = r * Math.abs(percentage - 0.5) * 2;

      var token = 'M{sx},{sy}' +
        'a{top.rx},{top.ry},0,0,{top.sweep},{top.x},0' +
        'a{bottom.rx},{bottom.ry},0,0,{bottom.sweep},{bottom.x},0';

      return Snap.format(token, {
        sx: center.x - r,
        sy: center.y,
        top: {
          rx: r,
          ry: r,
          sweep: name === 'top' ? 1 : 0,
          x: r * 2
        },
        bottom: {
          rx: r,
          ry: ry,
          sweep: name === 'top' ? percentage < 0.5 ? 0 : 1 : percentage < 0.5 ? 1 : 0,
          x: -r * 2
        }
      });
    }
  }

  function Mouth(selector, options) {
    var self = this;
    this.svg = Snap(selector);
    this.components = {
      nose: null,
      leftWhiskers: null,
      rightWhiskers: null
    };

    this.init = init;
    this.draw = draw;

    this.init();

    function init() {
      self.draw();
    }

    function draw() {
      _drawNose();
      _drawWhiskers();
    }

    function _drawNose() {
      var center = ShittyCatUtils.getCenter(self.svg.node);
      var ns = options.noseWidth;
      var nbs = ns * 0.15;
      var token = 'M0,0' +
        'Q{top.x1},{top.y1},{top.x},{top.y}' +
        'Q{right.x1},{right.y1},{right.x},{right.y}' +
        'l{nbs},0' +
        'Q{left.x1},{left.y1},{left.x},{left.y}';
      var nosePathStr = Snap.format(token, {
        top: {
          x1: ns / 2,
          y1: -20,
          x: ns,
          y: 0
        },
        right: {
          x1: ns / 2,
          y1: ns / 3,
          x: ns / 2 + nbs / 2,
          y: ns * 0.75
        },
        left: {
          x1: ns / 2,
          y1: ns / 3,
          x: 0,
          y: 0
        },
        nbs: -nbs
      });

      self.components.nose = self.svg
        .path(nosePathStr)
        .attr({
          class: 'cat-nose',
          fill: 'l(0,0,0,1)' + options.color + '-' + options.outer.stroke + ':30-' + options.color,
          transform: new Snap.Matrix().translate(center.x - options.noseWidth / 2, 20)
        });
    }

    function _drawWhiskers() {
      var w = 160;
      var token = 'M0,0l{w},{ly0}M0,{my1}l{w},0M0,{my2}l{w},{ly2}';
      var whiskersPathStr = Snap.format(token, {
        w: w,
        ly0: w / 4,
        my1: w / 2,
        my2: w,
        ly2: - w / 4
      });
      var whiskers = self.svg
        .path(whiskersPathStr)
        .attr({
          fill: 'none',
          stroke: 'l(0,0,1,0)' + options.color + '-' + options.outer.stroke + ':30-' + options.outer.stroke + ':70-' + options.color,
          strokeWidth: 6
        })
        .toDefs();

      self.components.leftWhiskers = self.svg
        .use(whiskers)
        .attr({ transform: new Snap.Matrix().translate(20, 10)});
      self.components.rightWhiskers = self.svg
        .use(whiskers)
        .attr({
          transform: new Snap.Matrix()
            .translate(self.svg.node.clientWidth - 20, 10)
            .scale(-1, 1)
        });
    }
  }

  var ShittyCat = new EyesController();
  global.ShittyCat = ShittyCat;

})(this);