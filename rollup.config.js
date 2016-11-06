
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

export default {
    entry: 'src/app.js',
    dest: 'dist/network.min.js',
    format: 'umd',
    moduleName: 'network',
    sourceMap: 'inline',
    plugins: [
        resolve({ jsnext: true, main: true, browser: true }),
        commonjs(),
        replace({
          exclude: 'node_modules/**',
          ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
    ],
};
