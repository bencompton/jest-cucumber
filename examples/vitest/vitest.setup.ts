// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, test } from 'vitest';
import { setJestCucumberConfiguration } from '../../src';

setJestCucumberConfiguration({
  runner: {
    describe,
    test,
  },
});
