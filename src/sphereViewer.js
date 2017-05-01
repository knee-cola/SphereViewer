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
    BoxGeometry as THREE_BoxGeometry,
    DoubleSide as THREE_DoubleSide,
    FrontSide as THREE_FrontSide,
    BackSide as THREE_BackSide,
    Matrix4 as THREE_Matrix4
  } from 'three'

import $ from 'jquery'

import {SphereControls} from './sphereControls'
import {ProgressiveImgLoader} from './progressiveImgLoader'
import {BallSpinnerLoader} from './ballSpinnerLoader'

function SphereViewer(config) {

	this.isDisposed = false;
	this.config = config = config || {};

	this.initViewport();
	this.initScene();
	
	if(this.config.sphere && !this.config.forceCube) {
	// IF image URLs are provided via a "sphere" param
	// AND cube geometry is not forced
	// > apply texture onto a sphere
		this.initSphere();
	} else {
	// ELSE apply texture onto a cube/box 
		this.initCube();
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
		materials;
	
	if(this.config.sphere) {
	// IF a sphereicaql image is to be used
	// > convert it from spherical projection (equirectangulat)
	//   to cubical projection (rectilinear)
		materials = this.loadEqui();
	} else if(this.config.tiles) {
	// ELSE IF the texture is proveded as separate tiles
	// > load each tile separatley
		materials = this.loadTiles();
	} else if(this.config.atlas) {
	// ELSE IF the texture is provided as a single Atlas image file
	// containing all the tiles
	// > load the atlas file and split it into tiles
		materials = this.loadAtlas();
	}

	this.mesh = new THREE_Mesh( new THREE_BoxGeometry( cubeSize, cubeSize, cubeSize ), materials );
	this.mesh.scale.x = -1; // flipping sphere inside-out - not the texture is rendered on the inner side
	this.scene.add(this.mesh);
	
	this.showLoader();

}; // proto.initCube = function(imgUrl) {...}

proto.loadTiles = function() {

	var self = this;
	var loadCounter=0;
	var tiles = this.config.tiles;
	var image_placeholder = document.createElement( 'canvas' );

	// the order of faces in the following array is IMPORTANT
	var materials = [
		'right',
		'left',
		'top',
		'bottom',
		'back',
		'front',
	].map(function(key) {
		var img = new Image(),
			texture = new THREE_Texture(image_placeholder);
		
		img.onload = function() {
			console.log(tiles[key]);
			texture.image = img;
			texture.needsUpdate = true;
			
			if(++loadCounter===6) {
				self.hideLoader();
			}
		};
		
		img.src = tiles[key];
		
		return(new THREE_MeshBasicMaterial({
			map: texture
		}));
	});
	
	return(materials);
}; // proto.loadTiles = function() {...}

proto.loadAtlas = function(imgUrl, materials, canvases) {

	var self = this;
	var imageObj=new Image();

	var canvases = [0,1,2,3,4,5].map(function(el) {
		return(document.createElement("canvas"));
	});

	var materials = canvases.map(function(canvas) {
		return(new THREE_MeshBasicMaterial({
			map: new THREE_Texture(canvas),
		}));
	});
	
	var tile2canvasIx = {
		right:0,
		left:1,
		top:2,
		bottom:3,
		front:4,
		back:5
	};
	
	// if the property is not set, then set the default order
	var tileOrder = this.config.tileOrder || ['right','left','top','bottom','front','back'];

	// this needs to be set in order not to get "Tainted canvases may not be loaded." WebGL error
	imageObj.crossOrigin = "anonymous";
	
	imageObj.onload = function() {
		var tileWidth = imageObj.height;

		tileOrder.forEach(function(key) {
			var ix = tile2canvasIx[key];
			
			var canvas = canvases[ix];
			canvas.height = tileWidth;
			canvas.width = tileWidth;

			var context = canvas.getContext( '2d' );
			context.drawImage( imageObj, tileWidth * ix, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
		
			materials[ix].map.needsUpdate = true;
		
		});
		
		self.hideLoader();
	}; // imgObj.onload = function() {...}
	
	imageObj.src = this.config.atlas;
	
	return(materials);

}; // proto.loadAtlas = function() {...}

proto.loadEqui = function() {

	var self = this;
	var imgObj=new Image();

	var canvases = [0,1,2,3,4,5].map(function(el) {
		return(document.createElement("canvas"));
	});

	var materials = canvases.map(function(canvas) {
		return(new THREE_MeshBasicMaterial({
			map: new THREE_Texture(canvas),
		}));
	});

	// this needs to be sit in order not to get "Tainted canvases may not be loaded." WebGL error
	imgObj.crossOrigin = "anonymous";
	
	imgObj.onload = function() {
		
		var srcWidth = imgObj.width,
			srcHeight = imgObj.height;
			
		// (3) when the image is loaded, start the conversion
		var inCanvas = document.createElement('canvas');
		inCanvas.width = srcWidth;
		inCanvas.height = srcHeight;

		var inCtx=inCanvas.getContext("2d");
		inCtx.drawImage(imgObj,0,0);

		var srcImg = inCtx.getImageData(0,0,srcWidth,srcHeight);
		
		self.equi2recti(srcImg, materials, canvases)

	}; // imgObj.onload = function() {...}

	// (2) start loading the image
	imgObj.src = this.config.sphere;

	return(materials);
	
}; // proto.loadEqui = function() {...}

proto.equi2recti = function(srcImg, materials, canvases) {

	var self = this,
		faceSize=srcImg.width/4;

	var imgOut = new ImageData(faceSize, faceSize); 

	var tileIx2canvasIx = {
		0:5, // back
		1:1, // left
		2:4, // front
		3:0, // right
		4:2, // top
		5:3 // bottom
	};
	
	var loadCounter = 0;

	var onWorkerMessage = function(event) {
	// (4) as each image is converted apply it to canvas used as texture
		
		var faceIx = event.data.faceIx,
			canvasIx = tileIx2canvasIx[faceIx],
			oneCanvas = canvases[canvasIx];
			
		oneCanvas.width = faceSize;
		oneCanvas.height = faceSize;
		
		oneCanvas.getContext("2d").putImageData(event.data.imgData,0,0);
		
		materials[canvasIx].map.needsUpdate = true;

		if(++loadCounter===6) {
			self.hideLoader();
		}
	};

	if(self.config.multiWorker) {

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
} // proto.equi2recti = function(srcImg, materials, canvases) {...}

proto.initSphere = function() {

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

  this.mesh = new THREE_Mesh(
      geometry,
      new THREE_MeshBasicMaterial({
        map: this.imgLoader.load(this.config.sphere),
        side: THREE_FrontSide // displaying the texture on the outer side of the sphere
      })
  );

  this.mesh.scale.x = -1; // flipping sphere inside-out - not the texture is rendered on the inner side
  this.scene.add(this.mesh);

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