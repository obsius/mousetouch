import babel from '@rollup/plugin-babel';

export default {
	input: 'src/Mousetouch.js',
	output: {
		exports: 'default',
		file: 'lib/index.js',
		format: 'cjs'
	},
	plugins: [
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**'
		})
	]
};