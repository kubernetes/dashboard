import webpack from '@cypress/webpack-preprocessor';
import failFast from 'cypress-fail-fast/plugin';
import del from 'del';
import {configuration} from './cy-ts-preprocessor';

// @ts-ignore
export default async (on, config) => {
  on('file:preprocessor', webpack(configuration));

  // Remove videos of successful tests and keep only failed ones.
  // @ts-ignore
  on('after:spec', (_, results) => {
    if (results.stats.failures === 0 && results.video) {
      return del(results.video);
    }
  });

  failFast(on, config);
  return config;
};
