import babel from 'rollup-plugin-babel';

export default {
	input: 'src/Mousetouch.js',
	output: {
		file: 'lib/Mousetouch.js',
		format: 'cjs'
	},
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]
};