import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, './dist'),
    target: 'es2015',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'polyfill-pseudoclass-has',
      formats: ['es', 'cjs', 'umd'],
      fileName: format => {
        if (format === 'es') return 'polyfill.esm.js';
        if (format === 'cjs') return 'polyfill.cjs';
        if (format === 'umd') return 'polyfill.umd.js';
        return 'polyfill.js';
      },
    },
  },
  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.prod.json'),
      rollupTypes: true,
    }),
  ],
});
