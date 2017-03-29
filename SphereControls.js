/**
 * SphereControls.js <https://github.com/knee-cola/SphereControls.js>
 * Released under the MIT license
 * @author knee-cola / https://github.com/knee-cola
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

(function(def){

	def(['three'], function(THREE){

		var SphereControls = function (camera, domElement, config) {

			var self = this;

			config = config || {};

			domElement = ( domElement !== undefined ) ? domElement : document;
			domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
			domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
			domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
			domElement.addEventListener( 'wheel', onDocumentMouseWheel, false );
			domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
			domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );
			domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );

			//  [initialTime] determins the how much the speed is initially decreased,
			//  after the user releases the mouse button - the higher the value,
			//  the larger initial drop in speed - don't go below 2
			var initialTime = 5,
				// [lubrication] determins how fast the speed decreases after the user
				// releases the mouse button. Larger value, the slower the speed drops
				lubrication = 60;

			var _isUserInteracting = false,
				_dragStartPosition ={
					x: null,
					y: null,
					lat: null,
					lon: null
				},
				_curr = {
					position: {
						lon: 90,
						lat: 0,
						phi: Math.PI/2,
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
				_target = new THREE.Vector3(),
				_speed = {
					phi: 0,
					theta: 0
				},
				_autoRotation = {
					enabled: !!config.autoRotate,
					suspended: !config.autoRotate,
					speed: Math.max(0, Math.min(10, config.autoRotateSpeed || 1)) / 1000 * (config.autoRotateDirection===-1 ? -1 : 1),
					delay: Math.max(config.autoRotateDelay || 5000, 1000), // after how much time shoud the automatic rotation start
					timeout: null

				}

			function onDocumentMouseDown( event ) {
				
				self.dispatchEvent({type: 'tap', originalEvent: event});

				event.preventDefault();
				_isUserInteracting = true;
				autoRotate_Stop();

				_curr.position.lon = THREE.Math.radToDeg( _curr.position.theta );
				_curr.position.lat = 90 - THREE.Math.radToDeg( _curr.position.phi );

				_dragStartPosition.x = event.clientX;
				_dragStartPosition.y = event.clientY;
				_dragStartPosition.lon = _curr.position.lon;
				_dragStartPosition.lat = _curr.position.lat;
			}
			function onDocumentMouseMove( event ) {
				if ( _isUserInteracting === true ) {
					_curr.position.lon = ( _dragStartPosition.x - event.clientX ) * 0.1 + _dragStartPosition.lon;
					_curr.position.lat = ( event.clientY - _dragStartPosition.y ) * 0.1 + _dragStartPosition.lat;
				}
			}
			function onDocumentMouseUp( event ) {
				_isUserInteracting = false;
				autoRotate_Start();
			}
			function onDocumentMouseWheel( event ) {
				camera.fov += event.deltaY * 0.05;
				camera.updateProjectionMatrix();
			}
			function onDocumentTouchStart( event ) {
				if ( event.touches.length == 1 ) {

					_isUserInteracting = true;
					autoRotate_Stop();

					self.dispatchEvent({type: 'tap', originalEvent: event});
					event.preventDefault();
					event.stopPropagation();
					_dragStartPosition.x = event.touches[ 0 ].pageX;
					_dragStartPosition.y = event.touches[ 0 ].pageY;

					_curr.position.lon = THREE.Math.radToDeg( _curr.position.theta );
					_curr.position.lat = 90 - THREE.Math.radToDeg( _curr.position.phi );

					_dragStartPosition.lon = _curr.position.lon;
					_dragStartPosition.lat = _curr.position.lat;
				}
			}
			function onDocumentTouchMove( event ) {
				if ( event.touches.length == 1 ) {
					event.preventDefault();
					event.stopPropagation();

					_curr.position.lon = ( _dragStartPosition.x - event.touches[0].pageX ) * 0.1 + _dragStartPosition.lon;
					_curr.position.lat = ( event.touches[0].pageY - _dragStartPosition.y ) * 0.1 + _dragStartPosition.lat;
				}
			}
			function onDocumentTouchEnd( event ) {
				_isUserInteracting = false;
				autoRotate_Start();
			}

			function autoRotate_Stop() {
				_autoRotation.suspended = true;

				if(_autoRotation.timeout) {
					window.clearTimeout(_autoRotation.timeout);
				}
			}

			function autoRotate_Start() {
				if(_autoRotation.enabled) {
					_autoRotation.timeout = window.setTimeout(function() {
						_autoRotation.timeout = null;
						_autoRotation.suspended = false;
					}, _autoRotation.delay);
				}
			}

			this.update = function() {

				if(_isUserInteracting) {

					_curr.position.lat = Math.max( - 85, Math.min( 85, _curr.position.lat ) );

					_curr.position.phi = THREE.Math.degToRad( 90 - _curr.position.lat );
					_curr.position.theta = THREE.Math.degToRad( _curr.position.lon );

					// calculate the drag speed
					_speed = {
						phi: _curr.position.phi - _prev.position.phi,
						theta: _curr.position.theta - _prev.position.theta
					};

					_curr.time = initialTime; // reset the time to initial time

					_prev.time2 = 1;

				} else {


					var time2 = _curr.time*_curr.time/lubrication;
					_curr.time++;

					// calculating the new value of speed
					_speed.phi = _speed.phi*_prev.time2 / time2;
					_speed.theta = _speed.theta*_prev.time2 / time2;

					_prev.time2 = time2;

					if(!_autoRotation.suspended) {
						_speed.theta = _autoRotation.speed < 0 ? Math.min(_speed.theta, _autoRotation.speed) : Math.max(_speed.theta, _autoRotation.speed);
					}

					// adjusting the camera angle
					_curr.position.phi += _speed.phi;
					_curr.position.theta += _speed.theta;

					if(_curr.position.phi>Math.PI) {
					// IF the camera hits the sphere bottom
					// > make it bouce back
						_curr.position.phi=Math.PI;
						_speed.phi = _speed.phi*-1;
					} else if(_curr.position.phi<0) {
					// IF the camera hits the sphere top
					// > make it bouce back
						_curr.position.phi=0;
						_speed.phi = _speed.phi*-1;
					}
				}

				_prev.position.phi = _curr.position.phi;
				_prev.position.theta = _curr.position.theta;

				_target.x = 500 * Math.sin( _curr.position.phi ) * Math.cos( _curr.position.theta );
				_target.y = 500 * Math.cos( _curr.position.phi );
				_target.z = 500 * Math.sin( _curr.position.phi ) * Math.sin( _curr.position.theta );

				camera.lookAt( _target );
			}

		}; // SphereControls = function (camera) {...}

		SphereControls.prototype = Object.create( THREE.EventDispatcher.prototype );

		return(SphereControls);
	});
})(
    // wrapper to run code everywhere
    // based on http://bit.ly/c7U4h5
    typeof require === 'undefined'?
        //Browser (regular script tag)
        function(deps, factory){
            this.SphereControls = factory(window.THREE);
        } :
        ((typeof exports === 'undefined')?
            //AMD
            function(deps, factory){
                define('SphereControls', deps, factory);
            } :
            //CommonJS
            function(deps, factory){
                module.exports = factory.apply(this, deps.map(require));
            }
        )
);