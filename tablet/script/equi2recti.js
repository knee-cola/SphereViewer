(function() {
	
	// get x,y,z coords from out image pixels coords
	// i,j are pixel coords
	// faceIdx is face number
	// faceSize is edge length
	function outImgToXYZ(i, j, faceIdx, faceSize) {
		var a = 2 * i / faceSize,
				b = 2 * j / faceSize;
	
		switch(faceIdx) {
			case 0: // back
	        return({x:-1, y:1-a, z:1-b});
	    case 1: // left
	        return({x:a-1, y:-1, z:1-b});
	    case 2: // front
	        return({x: 1, y:a-1, z:1-b});
	    case 3: // right
	        return({x:1-a, y:1, z:1-b});
	    case 4: // top
	        return({x:b-1, y:a-1, z:1});
	    case 5: // bottom
	        return({x:1-b, y:a-1, z:-1});
	
		}
	} // function outImgToXYZ(i, j, faceIdx, faceSize) {...}
	
	// convert using an inverse transformation
	function convertFace(imgIn, imgOut, faceIdx) {
	    var inPix = shimImgData(imgIn),
	    			outPix = shimImgData(imgOut),
	    			faceSize = imgOut.width,
	    			pi = Math.PI,
	    			pi_2 = pi/2;
	
	    for(var xOut=0;xOut<faceSize;xOut++) {
	    		for(var yOut=0;yOut<faceSize;yOut++) {
	    		
	            var xyz = outImgToXYZ(xOut, yOut, faceIdx, faceSize);
	            var theta = Math.atan2(xyz.y, xyz.x); // range -pi to pi
	            var r = Math.hypot(xyz.x,xyz.y);
	            var phi = Math.atan2(xyz.z,r); // range -pi/2 to pi/2
	
	            // source img coords
	            var uf = 0.5 * imgIn.width * (theta + pi) / pi;
	            var vf = 0.5 * imgIn.width * (pi_2 - phi) / pi;
	
	            // Use bilinear interpolation between the four surrounding pixels
	            var ui = Math.floor(uf);  // coord of pixel to bottom left
	            var vi = Math.floor(vf);
	            var u2 = ui+1;       // coords of pixel to top right
	            var v2 = vi+1;
	            var mu = uf-ui;      // fraction of way across pixel
	            var nu = vf-vi;
	
	            // Pixel values of four corners
	            var A = inPix.getPx(ui % imgIn.width, clip(vi, 0, imgIn.height-1));
	            var B = inPix.getPx(u2 % imgIn.width, clip(vi, 0, imgIn.height-1));
	            var C = inPix.getPx(ui % imgIn.width, clip(v2, 0, imgIn.height-1));
	            var D = inPix.getPx(u2 % imgIn.width, clip(v2, 0, imgIn.height-1));
	
	            // interpolate
	            var rgb = {
	              r:A[0]*(1-mu)*(1-nu) + B[0]*(mu)*(1-nu) + C[0]*(1-mu)*nu+D[0]*mu*nu,
	              g:A[1]*(1-mu)*(1-nu) + B[1]*(mu)*(1-nu) + C[1]*(1-mu)*nu+D[1]*mu*nu,
	              b:A[2]*(1-mu)*(1-nu) + B[2]*(mu)*(1-nu) + C[2]*(1-mu)*nu+D[2]*mu*nu
	            };
	            
	            rgb.r=Math.round(rgb.r);
	            rgb.g=Math.round(rgb.g);
	            rgb.b=Math.round(rgb.b);
	            
	            outPix.setPx(xOut, yOut, rgb);
	            
	        } // for(var yOut=0;yOut<faceSize;yOut++) {...}
	     } // for(var xOut=0;xOut<faceSize;xOut++) {...}
	} // function convertFace(imgIn, imgOut, faceIdx) {...}
	
	function clip(val, min, max) {
		return(val<min?min:(val>max?max:val));
	}
	
	function shimImgData(imgData) {
		var w=imgData.width*4,
				d=imgData.data;
	
		return({
			getPx:function(x,y) {
				x=x*4+y*w;
				return([ d[x], d[x+1], d[x+2] ]);
			},
			setPx:function(x,y,rgb) {
				x=x*4+y*w;
				d[x]=rgb.r;
				d[x+1]=rgb.g;
				d[x+2]=rgb.b;
				d[x+3]=255; // alpha
			}
		});
	} // function shimImgData(imgData) {...}

	this.Equi2Recti = {
		convertFace:convertFace
	};
})();