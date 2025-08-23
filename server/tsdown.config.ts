import { defineConfig } from 'tsdown';
import pkg from './package.json' with { type: 'json' };

export default defineConfig(({ watch }) => ({
  entry: ['./src'],
  outDir: '../dist/api',
  target: ['node22'],
  sourcemap: watch === true,
  // NOTE: Bundling it all without giving up on the distinction
  //       between dev- & prod dependencies. Except for `sqlite3`,
  //       which can't be bundled because of its native bindings.
  noExternal: Object.keys(pkg.dependencies).filter((mod) => mod !== 'sqlite3'),

  // NOTE: Referenced by `sequelize`, but only relevant for postgres.
  //       Setting this to be external to get rid of the warning in CI.
  external: ['pg-hstore'],
}));
