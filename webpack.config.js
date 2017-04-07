const path = require('path');

let isProd = process.env.NODE_ENV==='production';
let outputFilename = 'sphereViewer.'+(isProd ? 'min.js' : 'js');

module.exports = {
	// for [import] statements to work inside JS files, here we need to define paths
	// https://moduscreate.com/es6-es2015-import-no-relative-path-webpack/
	resolve: {
		modules: [
			path.resolve('./src'),
			path.resolve('./node_modules')
		]
	},
	// Defining JavaScript files, which act as entry points to application
	// > usually each is responsible for a separate sub-page
	// > Values listed here are used in [plugin] section, where we link subpages
	//   to coresponding entry points - search for [excludeChunks] & [chunks]
	entry: {
		app: './src/sphereViewer.js'
	},
	output: {
		// here we need to set an absolute path - we're resolve path at runtime
		path: path.resolve(__dirname, 'dist'),
		filename: outputFilename, // the [name] will be replaced by the name of entry JavaScript File
		library: 'SphereViewer', // this makes library bundle to be available as a global variable when imported
		libraryTarget: 'umd' // Possible value - amd, commonjs, commonjs2, commonjs-module, this, var, umd
	},
    externals: {
    	// this means that SphereViewer expects a dependency named "three" to be available in the consumer's environment.
        "three": {
            commonjs: "three",
            commonjs2: "three",
            amd: "three",
            root: "THREE"
        },
        "jquery-slim": {
            commonjs: "jquery-slim",
            commonjs2: "jquery-slim",
            amd: "jquery-slim",
            root: "$"
        }
    },
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			}
		]
	},
	plugins: [ ]
}