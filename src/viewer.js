/**
 * SphereViewer.js <https://github.com/knee-cola/SphereViewer.js>
 * Released under the MIT license
 * @author Nikola Derežić / https://github.com/knee-cola
 *
 * This class is an implementation of photosphere viewer.
 * It supports spherical images as created by the following cameras/software:
 *  - Ricoh Theta
 *  - Google PhotoSphere
 * 
 * How to use:
 * 
 *    // defining spinner config
 *    var config = {
 *      // (if set) the logo will be displayed at the bottom
 *      // of the sphere, which is usefull for hiding the triopod
 *      logo:'img/logo.png',
 *      // (if set) the usage hint is displayed in the center of the screen
 *      // and is hidden after the user clicks/taps the screen
 *      hint: isMobile ? 'img/sphere-icon-mobile.png' : 'img/sphere-icon-desktop.png',
 *      
 *      // overriding the default control config
 *      control: {
 *        autoRotate: true
 *      },
 *      
 *      // overidding the default spinner config
 *      spinner: {
 *        groupRadius: 20
 *      },
 *      
 *      // overriding the default THREE.js UV mapping
 *      uvMapper: (geometry) => { ... doing some custom UV mapping  }
 *    };
 *    
 *    var picUrls = ['img/sphere/preloader.jpg', 'img/sphere/hd.jpg']
 *    
 *    // creating a new instance of the viewer
 *    // ... the viewer will automaticall be appended to <body> and displayed
 *    var viewer = new SphereViewer.Viewer(picUrls, controlConfig);
 *    
 *    // adding event handlers:
 *    viewer.addEventListener('close', function() { console.log('sphere closed'); });
 * 
 */
import {
    EventDispatcher as THREE_EventDispatcher,
    WebGLRenderer as THREE_WebGLRenderer,
    Scene as THREE_Scene,
    PerspectiveCamera as THREE_PerspectiveCamera,
    SphereGeometry as THREE_SphereGeometry,
    Mesh as THREE_Mesh,
    MeshBasicMaterial as THREE_MeshBasicMaterial,
    TextureLoader as THREE_TextureLoader,
    PlaneGeometry as THREE_PlaneGeometry,
    FrontSide as THREE_FrontSide,
    BackSide as THREE_BackSide
  } from 'three'
import $ from 'jquery-slim'

import {SphereControls} from './sphereControls'
import {ProgressiveImgLoader} from './progressiveImgLoader'
import {BallSpinnerLoader} from './ballSpinnerLoader'

export function Viewer(imageUrls, config) {

  this.isDisposed = false;
  this.config = config = config || {};

  config.showCloseButton = !!config.showCloseButton;

  this.initViewport();
  this.initScene();
  this.initSphere(imageUrls);

  if(this.config.logo) {
    this.initLogo(this.config.logo, this.config.logoDistance===void 0 ? -15 : this.config.logoDistance);
  }

  if(this.config.hint) {
    this.showHint(this.config.hint);
  }

  this.initControls();

  // attaching a bound version of the method to the instance
  // > we'll need it to remove event listener
  this.onResize = this.onResize.bind(this);

  window.addEventListener('resize', this.onResize, false);
  window.setTimeout(this.onResize, 1);

  this.render();
};

var proto = Viewer.prototype = Object.create( THREE_EventDispatcher.prototype );

proto.initViewport = function() {

    var nativeW = window.devicePixelRatio * window.screen.availWidth,
        scale = 1/window.devicePixelRatio,
        viewportMeta = $('head meta[name="viewport"]');

    this.originalViewPortMeta = viewportMeta.attr('content');
    viewportMeta.attr('content', 'initial-scale='+scale+', maximum-scale='+scale+', user-scalable=0');

    // na mobitelima pixel ration NIJE 1
    var isMobile = window.devicePixelRatio!==1;

    this.container = document.createElement('div');
    this.container.className = 'sphere-container ' + (isMobile ? 'isMobile' : 'isDesktop');

    if(this.config.showCloseButton) {
      this.closeButton = document.createElement('i');
      this.closeButton.className = 'cmdCloseSphere material-icons';
      this.closeButton.innerHTML = 'highlight_off';
      this.container.appendChild(this.closeButton);
      // attaching a bound version of the method to the instance
      // > we'll need it to remove event listener
      this.closeButton_onClick = this.closeButton_onClick.bind(this);
      this.closeButton.addEventListener('click', this.closeButton_onClick);
    }

    document.getElementsByTagName('body')[0].appendChild(this.container);

  }; // proto.initViewport = function() {...}

proto.closeButton_onClick = function() {
  this.dispose();
};
proto.controls_onTap = function(ev) {
  // on first tap - hide the hint
  this.hideHint();
};

proto.initScene = function() {

  var body = document.getElementsByTagName('body')[0];

  this.renderer = new THREE_WebGLRenderer();

  this.renderer.setSize(body.scrollWidth, body.scrollHeight);
  this.container.appendChild(this.renderer.domElement);

  this.scene = new THREE_Scene();

  let fieldOfView = 90,
      aspectRatio = 1,
      near = 1,

      far = 1000;

  this.camera = new THREE_PerspectiveCamera(fieldOfView, aspectRatio, near, far);
  this.scene.add(this.camera);
}; // proto.initScene = function() {...}

proto.initSphere = function(imageUrls) {

  var speherRadius = 100,
      sphere_H_segments = 64,
      sphere_V_segments = 64;

  this.imgLoader = new ProgressiveImgLoader();

  this.loader_onDone = this.loader_onDone.bind(this);

  this.imgLoader.addEventListener('done', this.loader_onDone);

  var geometry = new THREE_SphereGeometry(speherRadius, sphere_H_segments, sphere_V_segments);

  // check if a special UV mapping function should be used
  if(this.config.uvMapper) {
    this.config.uvMapper(geometry);
  }

  this.sphere = new THREE_Mesh(
      geometry,
      new THREE_MeshBasicMaterial({
        map: this.imgLoader.load(imageUrls),
        side: THREE_FrontSide // displaying the texture on the outer side of the sphere
      })
  );

  this.sphere.scale.x = -1; // flipping sphere inside-out - not the texture is rendered on the inner side
  this.scene.add(this.sphere);

  this.showLoader();

}; // proto.initSphere = function(imageUrls) {...}

proto.initLogo = function(logoUrl, logoDistance) {

  var texLoader = new THREE_TextureLoader(),
    self = this;

  texLoader.crossOrigin = '';

  texLoader.load(logoUrl, function(texture) {
    self.logo = new THREE_Mesh(
        new THREE_PlaneGeometry(10,10),
        new THREE_MeshBasicMaterial({
          map: texture,
          side: THREE_FrontSide,
          transparent: true,
          opacity: 1
        })
    );

    self.logo.position.set(0,logoDistance,0);
    self.logo.rotation.x = -Math.PI/2;

    self.scene.add(self.logo);
  });

}; // proto.initLogo = function(imageUrls) {...}


/*---------------------------------------------------------------------*//**
 * Method displays an icon with instructions on how to use the viewer
 *
 * @param      {string}  hintUrl  URL of the image containing instructions
 */
proto.showHint = function(hintUrl) {

  var texLoader = new THREE_TextureLoader(),
    self = this;

  texLoader.crossOrigin = '';

  texLoader.load(hintUrl, function(texture) {
    self.hint = new THREE_Mesh(
          new THREE_PlaneGeometry(10,10),
          new THREE_MeshBasicMaterial({
            map: texture,
            side: THREE_FrontSide,
            transparent: true,
            opacity: 1
          })
      );

    self.hint.position.set(0,0,-30);
    // self.hint.rotation.x = -Math.PI/4;

    self.camera.add(self.hint);
  });
}; // proto.showHint = function(imageUrls) {...}

/*---------------------------------------------------------------------*//**
 * Method hides the hint
 */
proto.hideHint = function() {
  if(this.hint) {
    this.camera.remove(this.hint);
    this.hint = null;
  }
}

proto.initControls = function() {
  this.controls = new SphereControls(this.camera, this.renderer.domElement, this.config.control);
  this.controls_onTap = this.controls_onTap.bind(this);
  this.controls.addEventListener('tap', this.controls_onTap);
}; // proto.initControls = function() {...}

proto.onResize = function(ev) {
  var width = this.container.offsetWidth;
  var height = this.container.offsetHeight;

  if(this.camera) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  this.renderer.setSize(width, height);
}; // proto.onResize = function(ev) {...}

proto.render = function() {

  if(this.isDisposed) {
    return;
  }

  requestAnimationFrame(this.render.bind(this));

  this.dispatchEvent({type:'preRender', original:event });

  if(this.controls) {
    this.controls.update();
  }

  if(this.spinLoader) {
    this.spinLoader.animate();
  }

  this.renderer.render(this.scene, this.camera);
}; // proto.render = function() {...}

proto.showLoader = function() {
  this.spinLoader = new BallSpinnerLoader(this.config.spinner);
  this.camera.add(this.spinLoader.mesh);
  this.spinLoader.mesh.position.set(0,0,-50);
  
}; // proto.showLoader = function() {...}

proto.hideLoader = function() {
  if(this.spinLoader) {
    this.camera.remove(this.spinLoader.mesh);
    this.spinLoader = null;
  }
}; // proto.hideLoader = function() { ... }

proto.loader_onDone = function() {
  this.loader_onDone = null; // loader mi više nije potreban
  this.hideLoader();
};

proto.dispose = function() {

  window.removeEventListener('resize', this.onResize);

  if(this.closeButton) {
    this.closeButton.removeEventListener('click', this.closeButton_onClick);
  }

  this.controls.removeEventListener('tap', this.controls_onTap);

  this.imgLoader.dispose();

  this.isDisposed = true;
  this.container.remove();

  // restoring original viewport meta
  $('head meta[name="viewport"]').attr('content', this.originalViewPortMeta);

  this.loaderEl = this.imgLoader = this.closeButton = this.container = this.renderer = this.container = this.camera = this.scene = this.sphere = this.controls = null;

}; // proto.dispose = function() {...}