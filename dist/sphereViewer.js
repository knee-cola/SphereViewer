(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("THREE"), require("$"));
	else if(typeof define === 'function' && define.amd)
		define(["THREE", "$"], factory);
	else if(typeof exports === 'object')
		exports["SphereViewer"] = factory(require("THREE"), require("$"));
	else
		root["SphereViewer"] = factory(root["THREE"], root["$"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/* unknown exports provided */
/* all exports used */
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/* unknown exports provided */
/* all exports used */
/*!**********************************!*\
  !*** ./src/ballSpinnerLoader.js ***!
  \**********************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BallSpinnerLoader = undefined;

var _three = __webpack_require__(/*! three */ 0);

var BallSpinnerLoader = function BallSpinnerLoader(config) {
  config = config || {};

  this.groupRadius = config.groupRadius || 10;
  this.circleCount = config.circleCount || 8;
  this.circleRadius = config.circleRadius || 1;
  this.groupAngle = 0;

  // circles depending on their opacity will
  // have higer or lower opacity
  // [amplitude] defines the amplitude
  this.animationAmplitude = config.animationAmplitude || 10;

  this.circles = [];
  this.mesh = this.initGroup();
}; /**
    * BallSpinnerLoader.js <https://github.com/knee-cola/BallSpinnerLoader.js>
    * Released under the MIT license
    * @author Nikola Derežić / https://github.com/knee-cola
    *
    * This is a spinner/loader built for Three.js platform.
    * 
    * It can be used to notify user that some resources are being loaded.
    * I made it to replace pure CSS spinner, which was displayed in the
    * overlay above the 3D animation, since it was slowing down WebGL
    *
    * How to use:
    * 
    *    // defining spinner config
    *    var spinnerConfig = {
    *      groupRadius: 20, // outter radius of the spinner circle
    *      circleCount: 8, // number of spinner elements (circles)
    *      circleRadius: 5, // radius of each of the spinner elements (circles)
    *      // as they spin, circles are brought closer to the camera af their
    *      // opacity increases. Here we can define how close/far are
    *      // the elements pushed
    *      animationAmplitude: 10
    *    };
    *    
    *
    *    // creating a new spinner
    *    var spinLoader = new BallSpinLoader(spinnerConfig);
    *    
    *    // add spinner to the scene
    *    spinLoader.addToScene(scene);
    *
    *   // add it to the render funcion
    *   function render() {
    *
    *      requestAnimationFrame( render );
    *
    *     // make it spin
    *     spinLoader.animate();
    *
    *     renderer.render( scene, camera );
    *   }
    * 
    */


BallSpinnerLoader.prototype = {
  makeCircle: function makeCircle(config) {
    config = config || {};
    var circleRadius = config.radius || 5,
        circleSegments = config.segments || 16,
        //<-- Increase or decrease for more resolution I guess
    circleGeometry = new _three.CircleGeometry(circleRadius, circleSegments),
        circleMaterial = new _three.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: config.opacity, side: _three.DoubleSide });

    return {
      mesh: new _three.Mesh(circleGeometry, circleMaterial),
      opacityStep: config.opacityStep || 0.01
    };
  },
  addToScene: function addToScene(scene) {
    scene.add(this.mesh);
  },
  initGroup: function initGroup() {
    var mesh = new _three.Object3D(),

    // the opacity will be distributed symetrically
    // with maximum on one side of the circle group
    // and minimum at the opposite side
    currOpacity = 0,
        opacityStep = 1 / (this.circleCount / 2 + 1),

    // opacity will be animated - here we define how fast
    animationStep = 0.02,

    // circles are distributed evenly around the group edge
    currAngle = 0,
        angleStep = 2 * Math.PI / this.circleCount;

    for (var i = 0; i < this.circleCount; i++) {

      currOpacity += opacityStep;

      if (currOpacity > 1) {
        // IF the max opacity has been reached
        // > go into oposit direction
        currOpacity = 1 - opacityStep;
        opacityStep = -opacityStep;
        // reverse the opacity animation direction,
        // so that the second halve of the circles
        // is on the fade-out direction
        // ... the net result that the opacity minimum/maximum
        // will rotate around the group
        animationStep = -animationStep;
      }

      var oneCircle = this.makeCircle({ opacity: currOpacity, opacityStep: animationStep, radius: this.circleRadius });

      // oneCircle.rotation.x = Math.PI / 4; // rotiram krug tako da bude položen na ravninu
      var pos = this.polar2cartesian({ distance: this.groupRadius, radians: currAngle });
      oneCircle.mesh.position.set(pos.x, pos.y, currOpacity * this.animationAmplitude);

      currAngle += angleStep;

      mesh.add(oneCircle.mesh);
      this.circles.push(oneCircle);
    }

    return mesh;
  },
  polar2cartesian: function polar2cartesian(polar) {
    return {
      x: Math.round(polar.distance * Math.cos(polar.radians) * 1000) / 1000,
      y: Math.round(polar.distance * Math.sin(polar.radians) * 1000) / 1000
    };
  },
  animate: function animate() {
    this.mesh.rotation.z += 0.02;
    var circles = this.circles;
    var zStep = 50 / (this.circleCount / 2 + 1);

    for (var i = 0; i < circles.length; i++) {
      var oneCircle = circles[i],
          newOpacity = oneCircle.mesh.material.opacity + oneCircle.opacityStep,
          newRadius = oneCircle.mesh.geometry.radius;

      if (newOpacity > 1) {
        newOpacity = 1 - oneCircle.opacityStep;
        oneCircle.opacityStep = -oneCircle.opacityStep;
      } else if (newOpacity < 0) {
        newOpacity = oneCircle.opacityStep;
        oneCircle.opacityStep = -oneCircle.opacityStep;
      }

      oneCircle.mesh.material.opacity = newOpacity;
      oneCircle.mesh.position.z = newOpacity * this.animationAmplitude;
    }
  }
};

exports.BallSpinnerLoader = BallSpinnerLoader;

/***/ }),
/* 2 */
/* unknown exports provided */
/* all exports used */
/*!*************************************!*\
  !*** ./src/progressiveImgLoader.js ***!
  \*************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProgressiveImgLoader = undefined;

var _three = __webpack_require__(/*! three */ 0);

var ProgressiveImgLoader = function ProgressiveImgLoader() {}; /**
                                                                * ProgressiveImgLoader.js <https://github.com/knee-cola/ProgressiveImgLoader.js>
                                                                * Released under the MIT license
                                                                * @author Nikola Derežić / https://github.com/knee-cola
                                                                * 
                                                                * This is a simple progressive image loader for Three.js
                                                                * 
                                                                * It enables the smaller image (short loading time) files to be pre-loaded first,
                                                                * before the big texture image is fully loaded.
                                                                * 
                                                                * The images are loaded in the order they are passed to the loader
                                                                * 
                                                                * The loader dispatches the following events:
                                                                *  - progress = dispatched evey time an additional image was loaded
                                                                *  - done = dispatched after the last image was loaded
                                                                *  
                                                                * Here's a simple example:
                                                                * 
                                                                *  // Defining an array of different sizes of images
                                                                *  //
                                                                *  // Hint: apart from degrading image resolution, smaller image files
                                                                *  //       can also be produced by increasing the JPG compression
                                                                *  var imageUrls = ['480p.jpg', '720p.jpg', '1080p.jpg', '2048p.jpg']:
                                                                *  
                                                                *  // creating a new loader
                                                                *  var loader = new ProgressiveImageLoader(imageUrls);
                                                                *  
                                                                *  // registering event handlers
                                                                *  loader.addEventListener('progress', function() { console.log('progress');  });
                                                                *  loader.addEventListener('done', function() { console.log('done');  });
                                                                *  
                                                                *  // creating material - calling the [load] function
                                                                *  var material = new THREE.MeshBasicMaterial({ map: loader.load() })
                                                                *
                                                                *  var mesh = new THREE.Mesh(geometry, material);
                                                                *  
                                                                *  scene.add(mesh);
                                                                * 
                                                                */

var proto = ProgressiveImgLoader.prototype = Object.create(_three.EventDispatcher.prototype);

proto.load = function (images) {

  var self = this;

  var texture = new _three.Texture();

  // create an image object
  var imageObj = self.imageObj = new Image(),
      loadingIx = 0;

  // this needs to be sit in order not to get "Tainted canvases may not be loaded." WebGL error
  imageObj.crossOrigin = "anonymous";

  imageObj.onload = function () {

    // [imageObj] is set to NULL when the object is disposed
    if (self.imageObj) {

      texture.needsUpdate = true;

      if (loadingIx < images.length) {
        self.dispatchEvent({ type: 'progress', imageIndex: loadingIx });

        // don't change the image [src] until the texture had a chance to update itself
        window.setTimeout(function () {
          imageObj.src = images[loadingIx++];
        }, 1000);
      } else {
        self.dispatchEvent({ type: 'done' });
        self.imageObj = null;
      }
    }
  }; // imageObj.onload = function() {...}

  // the loading process will begin after we set the [src] property
  imageObj.src = images[loadingIx++];
  texture.image = imageObj;

  return texture;
}; // proto.load = function(images) {...}

proto.dispose = function () {
  // stop loading current image
  if (this.imageObj) {
    this.imageObj.src = '';
  }
  this.imageObj = null;
};

exports.ProgressiveImgLoader = ProgressiveImgLoader;

/***/ }),
/* 3 */
/* unknown exports provided */
/* all exports used */
/*!*******************************!*\
  !*** ./src/sphereControls.js ***!
  \*******************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SphereControls = undefined;

var _three = __webpack_require__(/*! three */ 0);

var SphereControls = function SphereControls(camera, domElement, config) {

	var self = this;

	config = config || {};

	domElement = domElement !== undefined ? domElement : document;
	domElement.addEventListener('mousedown', onDocumentMouseDown, false);
	domElement.addEventListener('mousemove', onDocumentMouseMove, false);
	domElement.addEventListener('mouseup', onDocumentMouseUp, false);
	domElement.addEventListener('wheel', onDocumentMouseWheel, false);
	domElement.addEventListener('touchstart', onDocumentTouchStart, false);
	domElement.addEventListener('touchend', onDocumentTouchEnd, false);
	domElement.addEventListener('touchmove', onDocumentTouchMove, false);

	//  [initialTime] determins the how much the speed is initially decreased,
	//  after the user releases the mouse button - the higher the value,
	//  the larger initial drop in speed - don't go below 2
	var initialTime = 5,

	// [lubrication] determins how fast the speed decreases after the user
	// releases the mouse button. Larger value, the slower the speed drops
	lubrication = 60;

	var _isUserInteracting = false,
	    _dragStartPosition = {
		x: null,
		y: null,
		lat: null,
		lon: null
	},
	    _curr = {
		position: {
			lon: 90,
			lat: 0,
			phi: Math.PI / 2,
			theta: 0
		},
		time: initialTime
	},
	    _prev = {
		position: {
			phi: _curr.position.phi,
			theta: _curr.position.theta
		},
		time2: 1
	},
	    _target = new _three.Vector3(),
	    _speed = {
		phi: 0,
		theta: 0
	},
	    _autoRotation = {
		enabled: !!config.autoRotate,
		suspended: !config.autoRotate,
		speed: Math.max(0, Math.min(10, config.autoRotateSpeed || 1)) / 1000 * (config.autoRotateDirection === -1 ? -1 : 1),
		delay: Math.max(config.autoRotateDelay || 5000, 1000), // after how much time shoud the automatic rotation start
		timeout: null

	};

	function onDocumentMouseDown(event) {

		// attache the original event as payload
		self.dispatchEvent({ type: 'tap', original: event });

		event.preventDefault();

		_isUserInteracting = true;
		autoRotate_Stop();

		_curr.position.lon = _three.Math.radToDeg(_curr.position.theta);
		_curr.position.lat = 90 - _three.Math.radToDeg(_curr.position.phi);

		_dragStartPosition.x = event.clientX;
		_dragStartPosition.y = event.clientY;
		_dragStartPosition.lon = _curr.position.lon;
		_dragStartPosition.lat = _curr.position.lat;
	}
	function onDocumentMouseMove(event) {
		if (_isUserInteracting === true) {
			_curr.position.lon = (_dragStartPosition.x - event.clientX) * 0.1 + _dragStartPosition.lon;
			_curr.position.lat = (event.clientY - _dragStartPosition.y) * 0.1 + _dragStartPosition.lat;
		}
		self.dispatchEvent({ type: 'mouseMove', original: event });
	}
	function onDocumentMouseUp(event) {
		_isUserInteracting = false;
		event.preventDefault();
		autoRotate_Start();
	}
	function onDocumentMouseWheel(event) {
		camera.fov += event.deltaY * 0.05;
		camera.updateProjectionMatrix();
	}
	function onDocumentTouchStart(event) {
		if (event.touches.length == 1) {

			_isUserInteracting = true;
			autoRotate_Stop();

			// attache the original event as payload
			self.dispatchEvent({ type: 'tap', original: event });

			event.preventDefault();
			event.stopPropagation();
			_dragStartPosition.x = event.touches[0].pageX;
			_dragStartPosition.y = event.touches[0].pageY;

			_curr.position.lon = _three.Math.radToDeg(_curr.position.theta);
			_curr.position.lat = 90 - _three.Math.radToDeg(_curr.position.phi);

			_dragStartPosition.lon = _curr.position.lon;
			_dragStartPosition.lat = _curr.position.lat;
		}
	}
	function onDocumentTouchMove(event) {
		if (event.touches.length == 1) {
			event.preventDefault();
			event.stopPropagation();

			_curr.position.lon = (_dragStartPosition.x - event.touches[0].pageX) * 0.1 + _dragStartPosition.lon;
			_curr.position.lat = (event.touches[0].pageY - _dragStartPosition.y) * 0.1 + _dragStartPosition.lat;
		}
	}
	function onDocumentTouchEnd(event) {
		_isUserInteracting = false;
		autoRotate_Start();
	}

	function autoRotate_Stop() {
		_autoRotation.suspended = true;

		if (_autoRotation.timeout) {
			window.clearTimeout(_autoRotation.timeout);
		}
	}

	function autoRotate_Start() {
		if (_autoRotation.enabled) {
			_autoRotation.timeout = window.setTimeout(function () {
				_autoRotation.timeout = null;
				_autoRotation.suspended = false;
			}, _autoRotation.delay);
		}
	}

	this.update = function () {

		if (_isUserInteracting) {

			_curr.position.lat = Math.max(-85, Math.min(85, _curr.position.lat));

			_curr.position.phi = _three.Math.degToRad(90 - _curr.position.lat);
			_curr.position.theta = _three.Math.degToRad(_curr.position.lon);

			// calculate the drag speed
			_speed = {
				phi: _curr.position.phi - _prev.position.phi,
				theta: _curr.position.theta - _prev.position.theta
			};

			_curr.time = initialTime; // reset the time to initial time

			_prev.time2 = 1;
		} else {

			var time2 = _curr.time * _curr.time / lubrication;
			_curr.time++;

			// calculating the new value of speed
			_speed.phi = _speed.phi * _prev.time2 / time2;
			_speed.theta = _speed.theta * _prev.time2 / time2;

			_prev.time2 = time2;

			if (!_autoRotation.suspended) {
				_speed.theta = _autoRotation.speed < 0 ? Math.min(_speed.theta, _autoRotation.speed) : Math.max(_speed.theta, _autoRotation.speed);
			}

			// adjusting the camera angle
			_curr.position.phi += _speed.phi;
			_curr.position.theta += _speed.theta;

			if (_curr.position.phi > Math.PI) {
				// IF the camera hits the sphere bottom
				// > make it bouce back
				_curr.position.phi = Math.PI;
				_speed.phi = _speed.phi * -1;
			} else if (_curr.position.phi < 0) {
				// IF the camera hits the sphere top
				// > make it bouce back
				_curr.position.phi = 0;
				_speed.phi = _speed.phi * -1;
			}
		}

		_prev.position.phi = _curr.position.phi;
		_prev.position.theta = _curr.position.theta;

		_target.x = 500 * Math.sin(_curr.position.phi) * Math.cos(_curr.position.theta);
		_target.y = 500 * Math.cos(_curr.position.phi);
		_target.z = 500 * Math.sin(_curr.position.phi) * Math.sin(_curr.position.theta);

		camera.lookAt(_target);
	};
}; // SphereControls = function (camera) {...}

/**
 * SphereControls.js <https://github.com/knee-cola/SphereControls.js>
 * Released under the MIT license
 * @author Nikola Derežić / https://github.com/knee-cola
 * 
 * This class controls the camera positioned in the middle of a sphere. It
 * allows the user to look around. It supports desktop (click events) and mobile
 * browser (touch events).
 * 
 * How to use:
 * 
 *  // defining te config for the controls
 * 	var controlConfig = {
 * 		autoRotate: true, // the camera should rotate automatially
 * 		autoRotateSpeed: 2, // the speed of automatic rotation
 * 		autoRotateDirection: -1, // the direction (1=left / -1=right)
 * 		autoRotateDelay: 5000 // for how long should automatic rotation be paused after a user interaction
 * 	};
 * 
 * 	var _ctrl = new SphereControls(_camera, _renderer.domElement, controlConfig);
 * 	
 * 	// attaching the event handler
 * 	_ctrl.addEventListener('tap', function() { console.log('user tapped the screen'); });
 * 
 *   function render() {
 *
 *      requestAnimationFrame( render );
 *
 *     // updating controls from the [render] function
 *     _ctrl.update();
 *
 *     _renderer.render( _scene, _camera );
 *   }
 *   
 */
SphereControls.prototype = Object.create(_three.EventDispatcher.prototype);

exports.SphereControls = SphereControls;

/***/ }),
/* 4 */
/* unknown exports provided */
/* all exports used */
/*!********************!*\
  !*** external "$" ***!
  \********************/
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/* unknown exports provided */
/* all exports used */
/*!*****************************!*\
  !*** ./src/sphereViewer.js ***!
  \*****************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Viewer = undefined;

var _three = __webpack_require__(/*! three */ 0);

var _jquery = __webpack_require__(/*! jquery */ 4);

var _jquery2 = _interopRequireDefault(_jquery);

var _sphereControls = __webpack_require__(/*! ./sphereControls */ 3);

var _progressiveImgLoader = __webpack_require__(/*! ./progressiveImgLoader */ 2);

var _ballSpinnerLoader = __webpack_require__(/*! ./ballSpinnerLoader */ 1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SphereViewer(config) {
	var paramType = Object.prototype.toString.call(config);

	if (config === void 0 || paramType === '[object String]' || paramType === '[object Array]') {
		throw new Error('the first (and only) parameter of SphereViewer must be a config object');
	}

	this.isDisposed = false;
	this.config = config = config || {};

	this.initViewport();
	this.initScene();

	if (this.config.sphere && !this.config.forceCube) {
		// IF image URLs are provided via a "sphere" param
		// AND cube geometry is not forced
		// > apply texture onto a sphere
		this.initSphere();
	} else {
		// ELSE apply texture onto a cube/box 
		this.initCube();
	}

	if (this.config.logo) {
		this.initLogo(this.config.logo, this.config.logoDistance === void 0 ? -15 : this.config.logoDistance);
	}

	if (this.config.hint) {
		this.showHint(this.config.hint);
	}

	this.initControls();

	// attaching a bound version of the method to the instance
	// > we'll need it to remove event listener
	this.onResize = this.onResize.bind(this);

	window.addEventListener('resize', this.onResize, false);
	window.setTimeout(this.onResize, 1);

	this.render();
} /**
   * SphereViewer.js <https://github.com/knee-cola/SphereViewer.js>
   * Released under the MIT license
   * @author Nikola Derežić / https://github.com/knee-cola
   */
;

var proto = SphereViewer.prototype = Object.create(_three.EventDispatcher.prototype);

proto.initViewport = function () {

	var nativeW = window.devicePixelRatio * window.screen.availWidth,
	    scale = 1 / window.devicePixelRatio,
	    viewportMeta = (0, _jquery2.default)('head meta[name="viewport"]');

	this.originalViewPortMeta = viewportMeta.attr('content');
	viewportMeta.attr('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=0');

	// na mobitelima pixel ration NIJE 1
	var isMobile = window.devicePixelRatio !== 1;

	this.container = document.createElement('div');
	this.container.className = 'sphere-container ' + (isMobile ? 'isMobile' : 'isDesktop');

	if (this.config.closeButtonHtml) {
		this.closeButton = document.createElement('i');
		this.closeButton.innerHTML = this.config.closeButtonHtml;
		this.container.appendChild(this.closeButton);
		// attaching a bound version of the method to the instance
		// > we'll need it to remove event listener
		this.closeButton_onClick = this.closeButton_onClick.bind(this);
		this.closeButton.addEventListener('click', this.closeButton_onClick);
	}

	document.getElementsByTagName('body')[0].appendChild(this.container);
}; // proto.initViewport = function() {...}

proto.closeButton_onClick = function () {
	this.dispose();
	this.dispatchEvent({ type: 'closed' });
};
proto.controls_onTap = function (ev) {
	// on first tap - hide the hint
	this.hideHint();
};

proto.initScene = function () {

	var body = document.getElementsByTagName('body')[0];

	this.renderer = new _three.WebGLRenderer();

	this.renderer.setSize(body.scrollWidth, body.scrollHeight);
	this.container.appendChild(this.renderer.domElement);

	this.scene = new _three.Scene();

	var fieldOfView = 90,
	    aspectRatio = 1,
	    near = 1,
	    far = 1000;

	this.camera = new _three.PerspectiveCamera(fieldOfView, aspectRatio, near, far);
	this.scene.add(this.camera);
}; // proto.initScene = function() {...}

proto.initCube = function (imgUrl) {

	var cubeSize = 100,
	    materials;

	if (this.config.sphere) {
		// IF a sphereicaql image is to be used
		// > convert it from spherical projection (equirectangulat)
		//   to cubical projection (rectilinear)
		materials = this.loadEqui();
	} else if (this.config.tiles) {
		// ELSE IF the texture is proveded as separate tiles
		// > load each tile separatley
		materials = this.loadTiles();
	} else if (this.config.atlas) {
		// ELSE IF the texture is provided as a single Atlas image file
		// containing all the tiles
		// > load the atlas file and split it into tiles
		materials = this.loadAtlas();
	}

	this.mesh = new _three.Mesh(new _three.BoxGeometry(cubeSize, cubeSize, cubeSize), materials);
	this.mesh.scale.x = -1; // flipping sphere inside-out - not the texture is rendered on the inner side
	this.scene.add(this.mesh);

	this.showLoader();
}; // proto.initCube = function(imgUrl) {...}

proto.loadTiles = function () {

	var self = this;
	var loadCounter = 0;
	var tiles = this.config.tiles;
	var image_placeholder = document.createElement('canvas');

	// the order of faces in the following array is IMPORTANT
	var materials = ['right', 'left', 'top', 'bottom', 'back', 'front'].map(function (key) {
		var img = new Image(),
		    texture = new _three.Texture(image_placeholder);

		img.onload = function () {
			console.log(tiles[key]);
			texture.image = img;
			texture.needsUpdate = true;

			if (++loadCounter === 6) {
				self.hideLoader();
			}
		};

		img.src = tiles[key];

		return new _three.MeshBasicMaterial({
			map: texture
		});
	});

	return materials;
}; // proto.loadTiles = function() {...}

proto.loadAtlas = function (imgUrl, materials, canvases) {

	var self = this;
	var imageObj = new Image();

	var canvases = [0, 1, 2, 3, 4, 5].map(function (el) {
		return document.createElement("canvas");
	});

	var materials = canvases.map(function (canvas) {
		return new _three.MeshBasicMaterial({
			map: new _three.Texture(canvas)
		});
	});

	var tile2canvasIx = {
		right: 0,
		left: 1,
		top: 2,
		bottom: 3,
		front: 4,
		back: 5
	};

	// if the property is not set, then set the default order
	var tileOrder = this.config.tileOrder || ['right', 'left', 'top', 'bottom', 'front', 'back'];

	// this needs to be set in order not to get "Tainted canvases may not be loaded." WebGL error
	imageObj.crossOrigin = "anonymous";

	imageObj.onload = function () {
		var tileWidth = imageObj.height;

		tileOrder.forEach(function (key) {
			var ix = tile2canvasIx[key];

			var canvas = canvases[ix];
			canvas.height = tileWidth;
			canvas.width = tileWidth;

			var context = canvas.getContext('2d');
			context.drawImage(imageObj, tileWidth * ix, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth);

			materials[ix].map.needsUpdate = true;
		});

		self.hideLoader();
	}; // imgObj.onload = function() {...}

	imageObj.src = this.config.atlas;

	return materials;
}; // proto.loadAtlas = function() {...}

proto.loadEqui = function () {

	var self = this;
	var imgObj = new Image();

	var canvases = [0, 1, 2, 3, 4, 5].map(function (el) {
		return document.createElement("canvas");
	});

	var materials = canvases.map(function (canvas) {
		return new _three.MeshBasicMaterial({
			map: new _three.Texture(canvas)
		});
	});

	// this needs to be sit in order not to get "Tainted canvases may not be loaded." WebGL error
	imgObj.crossOrigin = "anonymous";

	imgObj.onload = function () {

		var srcWidth = imgObj.width,
		    srcHeight = imgObj.height;

		// (3) when the image is loaded, start the conversion
		var inCanvas = document.createElement('canvas');
		inCanvas.width = srcWidth;
		inCanvas.height = srcHeight;

		var inCtx = inCanvas.getContext("2d");
		inCtx.drawImage(imgObj, 0, 0);

		var srcImg = inCtx.getImageData(0, 0, srcWidth, srcHeight);

		self.equi2recti(srcImg, materials, canvases);
	}; // imgObj.onload = function() {...}

	// (2) start loading the image
	imgObj.src = this.config.sphere;

	return materials;
}; // proto.loadEqui = function() {...}

proto.equi2recti = function (srcImg, materials, canvases) {

	var self = this,
	    faceSize = srcImg.width / 4;

	var imgOut = new ImageData(faceSize, faceSize);

	var tileIx2canvasIx = {
		0: 5, // back
		1: 1, // left
		2: 4, // front
		3: 0, // right
		4: 2, // top
		5: 3 // bottom
	};

	var loadCounter = 0;

	var onWorkerMessage = function onWorkerMessage(event) {
		// (4) as each image is converted apply it to canvas used as texture

		var faceIx = event.data.faceIx,
		    canvasIx = tileIx2canvasIx[faceIx],
		    oneCanvas = canvases[canvasIx];

		oneCanvas.width = faceSize;
		oneCanvas.height = faceSize;

		oneCanvas.getContext("2d").putImageData(event.data.imgData, 0, 0);

		materials[canvasIx].map.needsUpdate = true;

		if (++loadCounter === 6) {
			self.hideLoader();
		}
	};

	if (self.config.multiWorker) {

		for (var i = 0; i < 6; i++) {
			var w = new Worker("../src/equi2recti-worker.js");
			w.onmessage = onWorkerMessage;

			// begin converting the images
			w.postMessage({
				srcImg: srcImg,
				imgOut: imgOut,
				faceIx: i
			});
		}
	} else {
		var w = new Worker("../src/equi2recti-worker.js");
		w.onmessage = onWorkerMessage;

		// begin converting the images
		w.postMessage({
			srcImg: srcImg,
			imgOut: imgOut
		});
	}
}; // proto.equi2recti = function(srcImg, materials, canvases) {...}

proto.initSphere = function () {

	var speherRadius = 100,
	    sphere_H_segments = 64,
	    sphere_V_segments = 64;

	this.imgLoader = new _progressiveImgLoader.ProgressiveImgLoader();

	this.loader_onDone = this.loader_onDone.bind(this);

	this.imgLoader.addEventListener('done', this.loader_onDone);

	var geometry = new _three.SphereGeometry(speherRadius, sphere_H_segments, sphere_V_segments);

	// check if a special UV mapping function should be used
	if (this.config.uvMapper) {
		this.config.uvMapper(geometry);
	}

	this.mesh = new _three.Mesh(geometry, new _three.MeshBasicMaterial({
		map: this.imgLoader.load(this.config.sphere),
		side: _three.FrontSide // displaying the texture on the outer side of the sphere
	}));

	this.mesh.scale.x = -1; // flipping sphere inside-out - not the texture is rendered on the inner side
	this.scene.add(this.mesh);

	this.showLoader();
}; // proto.initSphere = function(imageUrls) {...}

proto.initLogo = function (logoUrl, logoDistance) {

	var texLoader = new _three.TextureLoader(),
	    self = this;

	texLoader.crossOrigin = '';

	texLoader.load(logoUrl, function (texture) {
		self.logo = new _three.Mesh(new _three.PlaneGeometry(10, 10), new _three.MeshBasicMaterial({
			map: texture,
			side: _three.FrontSide,
			transparent: true,
			opacity: 1
		}));

		self.logo.position.set(0, logoDistance, 0);
		self.logo.rotation.x = -Math.PI / 2;

		self.scene.add(self.logo);
	});
}; // proto.initLogo = function(imageUrls) {...}


/*---------------------------------------------------------------------*/ /**
                                                                          * Method displays an icon with instructions on how to use the viewer
                                                                          *
                                                                          * @param      {string}  hintUrl  URL of the image containing instructions
                                                                          */
proto.showHint = function (hintUrl) {

	var texLoader = new _three.TextureLoader(),
	    self = this;

	texLoader.crossOrigin = '';

	texLoader.load(hintUrl, function (texture) {
		self.hint = new _three.Mesh(new _three.PlaneGeometry(10, 10), new _three.MeshBasicMaterial({
			map: texture,
			side: _three.FrontSide,
			transparent: true,
			opacity: 1
		}));

		self.hint.position.set(0, 0, -30);
		// self.hint.rotation.x = -Math.PI/4;

		self.camera.add(self.hint);
	});
}; // proto.showHint = function(imageUrls) {...}

/*---------------------------------------------------------------------*/ /**
                                                                          * Method hides the hint
                                                                          */
proto.hideHint = function () {
	if (this.hint) {
		this.camera.remove(this.hint);
		this.hint = null;
	}
};

proto.initControls = function () {
	this.controls = new _sphereControls.SphereControls(this.camera, this.renderer.domElement, this.config.control);
	this.controls_onTap = this.controls_onTap.bind(this);
	this.controls.addEventListener('tap', this.controls_onTap);
}; // proto.initControls = function() {...}

proto.onResize = function (ev) {
	var width = this.container.offsetWidth;
	var height = this.container.offsetHeight;

	if (this.camera) {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}

	this.renderer.setSize(width, height);
}; // proto.onResize = function(ev) {...}

proto.render = function () {

	if (this.isDisposed) {
		return;
	}

	requestAnimationFrame(this.render.bind(this));

	this.dispatchEvent({ type: 'preRender', original: event });

	if (this.controls) {
		this.controls.update();
	}

	if (this.spinLoader) {
		this.spinLoader.animate();
	}

	this.renderer.render(this.scene, this.camera);
}; // proto.render = function() {...}

proto.showLoader = function () {
	this.spinLoader = new _ballSpinnerLoader.BallSpinnerLoader(this.config.spinner);
	this.camera.add(this.spinLoader.mesh);
	this.spinLoader.mesh.position.set(0, 0, -50);
}; // proto.showLoader = function() {...}

proto.hideLoader = function () {
	if (this.spinLoader) {
		this.camera.remove(this.spinLoader.mesh);
		this.spinLoader = null;
	}
}; // proto.hideLoader = function() { ... }

proto.loader_onDone = function () {
	this.loader_onDone = null; // loader mi više nije potreban
	this.hideLoader();
};

proto.dispose = function () {

	window.removeEventListener('resize', this.onResize);

	if (this.closeButton) {
		this.closeButton.removeEventListener('click', this.closeButton_onClick);
	}

	this.controls.removeEventListener('tap', this.controls_onTap);

	this.imgLoader.dispose();

	this.isDisposed = true;
	this.container.remove();

	// restoring original viewport meta
	(0, _jquery2.default)('head meta[name="viewport"]').attr('content', this.originalViewPortMeta);

	this.loaderEl = this.imgLoader = this.closeButton = this.container = this.renderer = this.container = this.camera = this.scene = this.sphere = this.controls = null;
}; // proto.dispose = function() {...}

exports.Viewer = SphereViewer;

/***/ })
/******/ ]);
});
//# sourceMappingURL=sphereViewer.js.map