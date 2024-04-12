# Run jest-cucumber with another test runner

## Vitest

### Use option `globals: true`

If you activate the `globals: true` option in your vitest configuration or via the `--globals` option, then you don't need to do anything jest-cucumber will work without any further manipulation.

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // ...
  },
});
```

### Use option `globals: false`

If you keep the `globals: false` option in your vitest configuration then you need to pass vitest `describe` and `test` methods to `jest-cucumber`.

When calling the `loadFeature` or `loadFeatures` function, you can inject the `describe` and `test` functions via `option.runner`, as in the example below:

```javascript
// scenario.steps.js
import { describe, test } from 'vitest';
import { loadFeature, defineFeature } from 'jest-cucumber';

const feature = loadFeature(
  'scenario.feature',
  {
    runner: {
      describe,
      test,
    }
  },
);

defineFeature(feature, (test) => {
  test('scenario', ({ given, when, then }) => {
    given('given', () => {
      // ...
    });

    when('when', () => {
      // ...
    });

    then('when', () => {
      // ...
    });
  });
});
```
To avoid having to keep repeating yourself, you can use your `setupFiles` to globally inject the `describe` and `test` methods via the `setJestCucumberConfiguration` function.

```javascript
// vitest.setup.ts
import { describe, test } from 'vitest';
import { setJestCucumberConfiguration } from 'jest-cucumber';

setJestCucumberConfiguration({
  runner: {
    describe,
    test,
  }
});
```