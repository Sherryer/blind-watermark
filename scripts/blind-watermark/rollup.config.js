import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { uglify } from "rollup-plugin-uglify";

export default {
    input: 'src/index.js',
    output: {
        file: 'lib/index.js',
        format: 'cjs',
        exports: 'auto'
    },
    plugins: [
        commonjs(),
        nodeResolve(),
        babel({ babelHelpers: 'bundled' }),
        uglify()
    ],
};
