/**
 * SphereViewer.js <https://github.com/knee-cola/SphereViewer.js>
 * Released under the MIT license
 * @author Nikola Derežić / https://github.com/knee-cola
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
    Texture as THREE_Texture,
    PlaneGeometry as THREE_PlaneGeometry,
    CubeGeometry as THREE_CubeGeometry,
    DoubleSide as THREE_DoubleSide,
    FrontSide as THREE_FrontSide,
    BackSide as THREE_BackSide,
    Matrix4 as THREE_Matrix4
  } from 'three'
import $ from 'jquery-slim'

import {SphereControls} from './sphereControls'
import {ProgressiveImgLoader} from './progressiveImgLoader'
import {BallSpinnerLoader} from './ballSpinnerLoader'

function SphereViewer(imageUrls, config) {

	this.isDisposed = false;
	this.config = config = config || {};

	this.initViewport();
	this.initScene();
	
	if(this.config.textureTarget === 'cube') {
		this.initCube(imageUrls);
	} else {
		this.initSphere(imageUrls);
	}
	
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

var proto = SphereViewer.prototype = Object.create( THREE_EventDispatcher.prototype );

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

    if(this.config.closeButtonHtml) {
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

proto.closeButton_onClick = function() {
  this.dispose();
  this.dispatchEvent({type:'closed'});
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

  var fieldOfView = 90,
      aspectRatio = 1,
      near = 1,

      far = 1000;

  this.camera = new THREE_PerspectiveCamera(fieldOfView, aspectRatio, near, far);
  this.scene.add(this.camera);
}; // proto.initScene = function() {...}

proto.initCube = function(imgUrl) {
	
	var cubeSize = 100,
		config = this.config;
	
	// (1) create 3D objects + use Canvas as texture
	var canvases = [0,1,2,3,4,5].map(function(el) {
		var canvas = document.createElement("canvas");
		// making canvas the same size as the image
		// which will be drawn on it
		//canvas.width = 1024;
		//canvas.height = 1024;
		
		return(canvas);
	});

	var materials = canvases.map(function(canvas) {
		return(new THREE_MeshBasicMaterial({
			map: new THREE_Texture(canvas),
		}));
	});

	this.mesh = new THREE_Mesh( new THREE_CubeGeometry( cubeSize, cubeSize, cubeSize ), materials );
	this.mesh.scale.x = -1; // flipping sphere inside-out - not the texture is rendered on the inner side
	this.scene.add(this.mesh);

	// this.showLoader();

	var imgObj=new Image();

	// this needs to be sit in order not to get "Tainted canvases may not be loaded." WebGL error
	imgObj.crossOrigin = "anonymous";
	
	imgObj.onload = function() {
		
		console.log('imgObj.onload');
	
		var srcWidth = imgObj.width,
			srcHeight = imgObj.height,
			faceWidth = srcWidth/4,
			faceHeight = faceWidth;		

		// (3) when the image is loaded, start the conversion
		var inCanvas = document.createElement('canvas');
		inCanvas.width = srcWidth;
		inCanvas.height = srcHeight;

		var inCtx=inCanvas.getContext("2d");
		inCtx.drawImage(imgObj,0,0);

		var srcImg = inCtx.getImageData(0,0,srcWidth,srcHeight);
		var imgOut = new ImageData(faceWidth,faceHeight); 
		
		var tileIx2canvasIx = {
			0:5, // back
			1:1, // left
			2:4, // front
			3:0, // right
			4:2, // top
			5:3 // bottom
		};

		var onWorkerMessage = function(event) {
		// (4) as each image is converted apply it to canvas used as texture
			
			var faceIx = event.data.faceIx,
				canvasIx = tileIx2canvasIx[faceIx],
				oneCanvas = canvases[canvasIx];
				
			oneCanvas.width = faceWidth;
			oneCanvas.height = faceHeight;
			
			oneCanvas.getContext("2d").putImageData(event.data.imgData,0,0);
			
			materials[canvasIx].map.needsUpdate = true;

			console.log('done '+event.data.faceIx);
		};

		if(config.multiWorker) {
			console.log('multiWorker');
			for(var i=0;i<6;i++) {
				var w = new Worker("../src/equi2recti-worker.js");
				w.onmessage = onWorkerMessage;

				// begin converting the images
				w.postMessage({
					srcImg: srcImg,
					imgOut: imgOut,
					faceIx:i
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
	}; // imgObj.onload = function() {...}

	// (2) start loading the image
	imgObj.src = imgUrl;

}; // proto.initCube = function() {...}

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

export { SphereViewer as Viewer }