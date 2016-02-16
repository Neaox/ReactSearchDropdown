var gulp = require('gulp');
var rollup = require('rollup-stream');
var babel = require('rollup-plugin-babel');
var npm = require('rollup-plugin-npm');
var commonjs = require('rollup-plugin-commonjs');
var replace = require('rollup-plugin-replace');
var source = require('vinyl-source-stream');

gulp.task('default', function(){
   	rollup({
   		entry: './src/ReactSearchDropdown.jsx',
        sourceMap: 'inline',
        plugins: [
		    npm({
		    	jsnext: true,
		    	main: true,
	    	}),
	    	commonjs({
	    		sourceMap: true
	    	}),
	    	replace({
		      'process.env.NODE_ENV': JSON.stringify('development')
		    }),	    
		    babel({
	    		sourceMap: true,
	    		exclude: 'node_modules/**',
    		 	presets: ["es2015-rollup", "react"]

	    	})
	    ]
    })
	.pipe(source('index.js'))
	.pipe(gulp.dest('./dist'));
});