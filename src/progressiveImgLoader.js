/**
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

import {
    EventDispatcher as THREE_EventDispatcher,
    Texture as THREE_Texture
  } from 'three'

var ProgressiveImgLoader = function() {

  var self = this;

  self.texture = new THREE_Texture();

  // create an image object
  self.imageObj = new Image();
  // this needs to be sit in order not to get "Tainted canvases may not be loaded." WebGL error
  self.imageObj.crossOrigin = "anonymous";

  self.imageObj.onload = function() {

    // [imageObj] is set to NULL when the object is disposed
    if(self.imageObj) {

      self.texture.needsUpdate = true;

      if(self.loadingIx < self.images.length) {
        self.dispatchEvent({type: 'progress', imageIndex: self.loadingIx});

        // don't change the image [src] until the texture had a chance to update itself
        window.setTimeout(function() {
          self.imageObj.src = self.images[self.loadingIx++];
        }, 1000);

      } else {
        self.dispatchEvent({type: 'done'});
      }
        
    }

  }; // imageObj.onload = function() {...}
  
  self.texture.image = self.imageObj;

};

var proto = ProgressiveImgLoader.prototype = Object.create( THREE_EventDispatcher.prototype );

proto.load = function(images) {

  var self = this;

  self.images = images;
  self.loadingIx = 0;

  // the loading process will begin after we set the [src] property
  self.imageObj.src = self.images[self.loadingIx++];

  return(self.texture);

}; // proto.load = function(images) {...}

proto.dispose = function() {
  // stop loading current image
  if(this.imageObj) {
    this.imageObj.src = '';
  }
  this.imageObj = null;
};

export {ProgressiveImgLoader}