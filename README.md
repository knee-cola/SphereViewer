# SphereViewer.js

Displays photo spheres created with Ricoh Theta or Google Photosphere app on mobile and desktop browsers.

## Features
*customizable through config
*image preloading for slower connection
*displays spinner while loading images
*can hide the triopod by displaying custom logo at the sphere bottom
*can display user instructions (PNG image)
*configurable
*supports vanilla JavaScript and AMD
*supports UV mapping customization

## Dependencies
SphereViewer was build and tested with Three.js v84

## Live Demo
Live demo is available on CodePen.io http://codepen.io/knee-cola/pen/vxQYNL

## Usage example

```javascript
// defining spinner config
var config = {
  // (if set) the logo will be displayed at the bottom
  // of the sphere, which is usefull for hiding the triopod
  logo:'img/logo.png',
  // (if set) the usage hint is displayed in the center of the screen
  // and is hidden after the user clicks/taps the screen
  hint: isMobile ? 'img/sphere-icon-mobile.png' : 'img/sphere-icon-desktop.png',
  
  // overriding the default control config
  control: {
    autoRotate: true
  },
  
  // overidding the default spinner config
  spinner: {
    groupRadius: 20
  },

  // Here we could override the default THREE.js UV mapping, by providing a mapper function
  // uvMapper: (geometry) => { ... doing some custom UV mapping ...  }
};

var picUrls = ['img/sphere/preloader.jpg', 'img/sphere/hd.jpg']

// creating a new instance of the viewer
// ... the viewer will automaticall be appended to <body> and displayed
var viewer = new SphereViewer.Viewer(picUrls, controlConfig);

// adding event handlers:
viewer.addEventListener('close', function() { console.log('sphere closed'); });
```
## License
SphereViewer is licensed under the MIT License.
