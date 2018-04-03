# Shitty Cat Svg

糞貓.svg

![Meow](https://i.imgur.com/GDvb7dW.gif)

[Demo](https://skyduck0205.github.io/shitty-cat-svg/)


## Dependencies

- [Snap.svg 5.x](http://snapsvg.io/)
- [lodash 4.x](https://lodash.com/)
- A cat lover/hater


## Usage

Include scripts and styles in your html:

```html
<script src="path/to/lodash.min.js"></script>
<script src="path/to/shitty-cat-svg.min.js"></script>
<link rel="stylesheet" href="path/to/shitty-cat-svg.min.css">
```

Add a cat element with the default id `shitty-cat` and call the `ShittyCat.init` method.

```html
<div id="shitty-cat"></div>
```

```javascript
ShittyCat.init();
```

Then there should be a lovely face staring at you.


## Configuration

Your shitty cat can be customized by passing an object as a parameter of the `init` method:

|Property|Type|Default|Description|
|---|---|---|--|
|id|string|`shitty-cat`|id of the container element|
|color|string|`#000`|color of the shitty cat face|
|distance|number|`180`|distance between eyes|
|outer|object||config of outer circle(the white part of eyes)|
|outer.R|number|`120`|radius of outer circle|
|outer.fill|string|`#FFF`|color of outer circle|
|outer.stroke|string|`#666`|color of outer orbit|
|outer.strokeWidth|number|`6`|width of outer orbit|
|inner|object||config of inner circle(iris)|
|inner.R|number|`100`|radius of inner circle|
|inner.color|string|`#FB6:70-#F72`|color of inner circle|
|pupil|object||config of pupil|
|pupil.R|number|`70`|radius of pupil|
|pupil.color|string|`#FB6:70-#F72`|color of pupil|
|faceWidth|number|`1000`|width between left/right whiskers|
|noseWidth|number|`80`|width of nose|

All the attributes are optional. The option parameter will be merged with the default option object.

How color gradient works: [Snap.svg#Paper.gradient](http://snapsvg.io/docs/#Paper.gradient)

## Classes

### EyesController
|Property|Type|Description|
|---|---|---|
|components|object|main components of the shitty cat|
|components.leftEye|[Eye](#Eye)|left eye|
|components.rightEye|[Eye](#Eye)|right eye|
|components.mouth|[Mouth](#Mouth)|mouth|
|options|object|configuration options|
|actions|object|shitty cat actions, see [ShittyCatActions API](#ShittyCatActions)|
|(methods)|function|see [ShittyCat API](#ShittyCat)|

### Eye
|Property|Type|Description|
|---|---|---|
|svg|Snap.Element|Snap element of eye|
|components|object|children components of eye|
|(methods)|function|see [Eye API](#ShittyCat)|

### Mouth
|Property|Type|Description|
|---|---|---|
|svg|Snap.Element|Snap element of mouth|
|components|object|children components of mouth|

## API

### ShittyCat

`window.ShittyCat` is an instance of [EyesController](#EyesController).

#### init([options=DEFAULT_OPTIONS])

- `options` (object): Shitty cat options. For default options, see [Configuration](#Configuration).

Initialize the shitty cat. It does:
1. Merge options with current option.
1. Create components of the shitty cat with `.draw()`.
1. Load default actions.

#### loadActions(actions)

- `actions` (object): New actions.

Add new actions to shitty cat. The method binds `ShittyCat` as `this` for all actions.
```javascript
ShittyCat.loadActions({
  lookLeft: function() {
    this.components.leftEye.move(-50, 0, 100);
    this.components.rightEye.move(-50, 0, 100);
  }
});

ShittyCat.actions.lookLeft();
```

#### miniMode(mini, [r=60])

- `mini` (boolean): Should transform into mini mode or not.
- `r` (number): Radius of eyes in mini mode.

#### destroy()

Remove all elements inside the container.

---

### Eye

#### move(x, y, [duration, easing])

- Return: (Promise): Animation promise.

#### resetMove([duration, easing])

- Return: (Promise): Animation promise.

#### moveInner(x, y, [duration, easing])

- Return: (Promise): Animation promise.

#### movePupil(x, y, [duration, easing])

- Return: (Promise): Animation promise.

#### scalePupil(x, y, [duration, easing])

- Return: (Promise): Animation promise.

#### resetScalePupil([duration, easing])

- Return: (Promise): Animation promise.

#### moveEyelid(name, percentage, [duration, easing])

- Return: (Promise): Animation promise.

#### moveEyelids(topPercentage, bottomPercentage, [duration, easing])

- Return: (Promise): Animation promise.

#### resetMoveEyelids([duration, easing])

- Return: (Promise): Animation promise.

#### rotateEyelid(name, deg, [duration, easing])

- Return: (Promise): Animation promise.

#### resetRotateEyelids([duration, easing])

- Return: (Promise): Animation promise.

---

### ShittyCatActions

#### wait(t)

- `t` (number): Milliseconds to wait.
- Return: (Promise): Animation promise.

#### look(, [t=200])

- `position` (object|string): Where the cat will look at. The value could be an object with format: `{ x: number, y: nubmer }`, or a string of direction `'TL'`, `'T'`, `'TR'`, `'L'`, `'M'`, `'R'`, `'BL'`, `'B'`, `'BR'`.
- `t` (number):  Animation duration in millisecond.
- Return: (Promise): Animation promise.

#### lookAround()
- Return: (Promise): Animation promise.

#### blink([name])
- `name` (string): Blink `'left'` or `'right'` eye. Blink both eyes if not assigned.
- Return: (Promise): Animation promise.

#### spin([times=2])
- `times` (number): How many times eyes will spin.
- Return: (Promise): Animation promise.

#### close()
- Return: (Promise): Animation promise.

#### open()
- Return: (Promise): Animation promise.

#### stop([t=200])
- `t` (number):  Animation duration in millisecond.
- Return: (Promise): Animation promise.

Stop current action and rest the components to their initial states.

#### normal()
- Return: (Promise): Animation promise.

#### angry()
- Return: (Promise): Animation promise.

#### sad()
- Return: (Promise): Animation promise.

#### happy()
- Return: (Promise): Animation promise.

#### sleepy()
- Return: (Promise): Animation promise.

#### wake()
- Return: (Promise): Animation promise.

#### search()
- Return: (Promise): Animation promise.

---

### ShittyCatUtils

#### getCenter(element)
- `element` (HTMLElement): Element.
- Return: `{ x: number, y: number }`: Center of the element.

Get center position of input element from its width and height.

#### getDistance(x, y, [x0=0, y0=0])
- `x` (number): End coordinate X.
- `y` (number): End coordinate Y.
- `y0` (number): Start coordinate Y.
- `y0` (number): Start coordinate Y.
- Return: (number): Distance between two points.

#### getInnerRatio(options)
- `options` (object): Shitty cat options.
- Return: (number): Ratio of inner and outer radius.

---

### Other Extended Methods

#### Math.fit(n, range)
- `n` (number): Input number.
- `range` ([number, number]): Minimum and maximum bounding.
- Return: (number): If `n` is out of range, return the min or max number. Else return itself.

#### Math.randomInt(min, max)
- Return: (number): A random integer within the range.
- `n` (number): Input number.

#### Paper.prototype.circlePath(cx, cy, r)
- `cx` (number): Center coordinate X.
- `cy` (number): Center coordinate Y.
- `r` (number): Radius of circle.
- Return: (Snap.Element): A path object.

#### Element.prototype.animatePromise(attrs, [duration, easing])
- Return: (Promise): Animation promise.

For more information, see: [Snap.svg#Element.animate](http://snapsvg.io/docs/#Element.animate).

#### Snap.animatePromise(rom, to, setter, [duration, easing])
- Return: (Promise): Animation promise.

For more information, see: [Snap.svg#Snap.animate](http://snapsvg.io/docs/#Snap.animate).
