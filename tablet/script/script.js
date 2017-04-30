// http://stackoverflow.com/questions/29678510/convert-21-equirectangular-panorama-to-cube-map
var logCount=10;

window.onload = function() {
	var scale = 1/window.devicePixelRatio;
	$('head meta[name="viewport"]').attr('content', 'initial-scale='+scale+', maximum-scale='+scale+', user-scalable=0');
	
	var img=new Image();
	
//	var img = document.getElementById("myImg");
	
	img.onload = function() {

		var inCanvas = document.createElement('canvas');
		inCanvas.width = img.width;
		inCanvas.height = img.height;

		var inCtx=inCanvas.getContext("2d");
		inCtx.drawImage(img,0,0);

		var srcImg = inCtx.getImageData(0,0,img.width,img.height);
		var imgOut = new ImageData(srcImg.width/4, srcImg.width/4); 
		
		var w = new Worker("../src/equi2recti-worker.js");
		var canvasIDs = {
			0:'back',
			1:'left',
			2:'front',
			3:'right',
			4:'top',
			5:'bottom'
		};

		w.onmessage = function(event) {
			var bodyCanvas=document.getElementById(canvasIDs[event.data.faceIx]);
				bodyCanvas.width = imgOut.width;
				bodyCanvas.height = imgOut.height;
			
			bodyCanvas.getContext("2d").putImageData(event.data.imgData,0,0);
			console.log('done '+event.data.faceIx);
		};

		w.postMessage({
			srcImg: srcImg,
			imgOut: imgOut
		});
/*
		makeFace(srcImg, 'back', 0);
		makeFace(srcImg, 'left', 1);
		makeFace(srcImg, 'front', 2);
		makeFace(srcImg, 'right', 3);
		makeFace(srcImg, 'top', 4);
		makeFace(srcImg, 'bottom', 5);
*/
	};

	

	function makeFace(inImgData, canvasID, faceID) {
			var outImgData = new ImageData(inImgData.width/4, inImgData.width/4); 
	
			Equi2Recti.convertFace(inImgData, outImgData, faceID); // BOTTOM
	
		  var bodyCanvas=document.getElementById(canvasID);
			bodyCanvas.width = outImgData.width;
			bodyCanvas.height = outImgData.height;
			
			bodyCanvas.getContext("2d").putImageData(outImgData,0,0);
			
			console.log('done '+faceID);
	}	
};