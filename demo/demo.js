(function() {

'use strict';

angular.module('Demo', []);
angular.module('Demo')
  .controller('DemoController', ['$scope', '$timeout', DemoController]);

function DemoController($scope, $timeout) {
  var DURATION = 100;
  $scope.cat = ShittyCat;
  $scope.controlForm = {
    eye: {
      moveX: 0,
      moveY: 0
    },
    pupil: {
      scaleX: 1,
      scaleY: 1
    },
    eyelid: {
      closeTop: 0,
      closeBottom: 0,
      rotateTop: 0,
      rotateBottom: 0
    },
    isMini: false,
    isTracking: false
  };
  $scope.optionsForm = {
    color: '',
    distance: 0,
    outer: {
      R: 0,
      fill: '',
      stroke: '',
      strokeWidth: 0
    },
    inner: {
      R: 0,
      color: ''
    },
    pupil: {
      R: 0,
      color: ''
    },
    faceWidth: 0,
    noseWidth: 0
  };
  $scope.positions = ['TL', 'T', 'TR', 'L', 'M', 'R', 'BL', 'B', 'BR'];
  $scope.expressions = ['stop', 'normal', 'angry', 'sad', 'happy', 'sleepy', 'wake', 'search'];
  $scope.expression = 'none';

  $scope.onMiniClick = onMiniClick;
  $scope.onTrackClick = onTrackClick;
  $scope.onMouseMove = onMouseMove;
  $scope.onMoveApply = onMoveApply;
  $scope.onPupilScaleApply = onPupilScaleApply;
  $scope.onEyelidCloseApply = onEyelidCloseApply;
  $scope.onEyelidRotateApply = onEyelidRotateApply;
  $scope.onExpressionClick = onExpressionClick;
  $scope.onOptionsApply = onOptionsApply;

  $scope.cat.init();
  $scope.optionsForm = _.cloneDeep($scope.cat.options);

  function onMiniClick() {
    $scope.controlForm.isMini = !$scope.controlForm.isMini;
    $scope.cat.miniMode($scope.controlForm.isMini);
    if ($scope.controlForm.isMini) {
      $timeout(function() {
        var bounding = document.querySelector('.video').getBoundingClientRect();
        $scope.onMouseMove({
          pageX: (bounding.x + bounding.width / 2),
          pageY: (bounding.y + bounding.height / 2)
        }, 200);
      });
    } else {
      $scope.cat.actions.look('M');
    }
  }

  function onTrackClick() {
    $scope.controlForm.isTracking = !$scope.controlForm.isTracking;
    if ($scope.controlForm.isTracking) {
      window.addEventListener('mousemove', $scope.onMouseMove);
    } else {
      window.removeEventListener('mousemove', $scope.onMouseMove);
      $scope.cat.actions.look('M');
    }
  }

  function onMouseMove(e, duration) {
    duration = duration || 1;
    var distance = 6;
    var eyeNames = ['leftEye', 'rightEye'];
    eyeNames.forEach(function(eName) {
      var eye = $scope.cat.components[eName];
      var bounding = eye.svg.node.getBoundingClientRect();
      var x = e.pageX - (bounding.x + bounding.width / 2);
      var y = e.pageY - (bounding.y + bounding.height / 2);
      eye.move(x / distance, y / distance, duration);
    });
  }

  function onMoveApply() {
    var x = $scope.controlForm.eye.moveX;
    var y = $scope.controlForm.eye.moveY;
    $scope.cat.components.leftEye.move(x, y, DURATION);
    $scope.cat.components.rightEye.move(x, y, DURATION);
  }

  function onPupilScaleApply() {
    var x = $scope.controlForm.pupil.scaleX;
    var y = $scope.controlForm.pupil.scaleY;
    $scope.cat.components.leftEye.scalePupil(x, y, DURATION);
    $scope.cat.components.rightEye.scalePupil(x, y, DURATION);
  }

  function onEyelidCloseApply() {
    var top = $scope.controlForm.eyelid.closeTop;
    var bottom = $scope.controlForm.eyelid.closeBottom;
    $scope.cat.components.leftEye.moveEyelid('top', top, DURATION);
    $scope.cat.components.leftEye.moveEyelid('bottom', bottom, DURATION);
    $scope.cat.components.rightEye.moveEyelid('top', top, DURATION);
    $scope.cat.components.rightEye.moveEyelid('bottom', bottom, DURATION);
  }

  function onEyelidRotateApply() {
    var top = $scope.controlForm.eyelid.rotateTop;
    var bottom = $scope.controlForm.eyelid.rotateBottom;
    $scope.cat.components.leftEye.rotateEyelid('top', top, DURATION);
    $scope.cat.components.leftEye.rotateEyelid('bottom', bottom, DURATION);
    $scope.cat.components.rightEye.rotateEyelid('top', -top, DURATION);
    $scope.cat.components.rightEye.rotateEyelid('bottom', -bottom, DURATION);
  }

  function onExpressionClick(expression) {
    $scope.expression = expression;
    $scope.cat.actions[expression]();
  }

  function onOptionsApply() {
    if ($scope.controlForm.isMini) {
      $scope.onMiniClick();
    }
    $scope.cat.actions.stop(0)
      .then(function() {
        $scope.cat.destroy();
        $scope.cat.init($scope.optionsForm);
        $scope.expression = 'none';
        $scope.$apply();
      });
  }
}

})();

