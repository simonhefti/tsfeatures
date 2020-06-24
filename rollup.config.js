import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/tsfeatures.js',
  output: {
    file: 'tsfeatures.js',
    format: 'umd',
    name: 'tsfeatures'
  },
  plugins: [resolve( {}),commonjs()]
};