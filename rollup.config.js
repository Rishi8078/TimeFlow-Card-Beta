import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/pacecard.ts',
  output: {
    file: 'dist/pacecard.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    terser(),
  ],
}; 