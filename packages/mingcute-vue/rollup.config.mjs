import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const external = ['vue'];

export default [
  // ESM
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: [
      resolve(),
      typescript({
        outDir: 'dist/esm',
        declaration: true,
        declarationDir: 'dist/esm',
      }),
    ],
  },
  // CJS
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named',
    },
    external,
    plugins: [
      resolve(),
      typescript({
        outDir: 'dist/cjs',
        declaration: true,
        declarationDir: 'dist/cjs',
      }),
    ],
  },
];
