import { loadFeature, defineFeature, DefineStepFunction } from '../../src';

const feature = loadFeature('./specs/features/markdown-support.en-pirate.feature.md');

// FIXME - code generation is not working....
// FIXME - tests are not captured...
// Root Cause - https://github.com/cucumber/common/blob/b43e36f5e0123023a71e5be859aef73209e2e796/gherkin/javascript/src/GherkinInMarkdownTokenMatcher.ts#L84
// Language has to be set as a global option
defineFeature(feature, (test) => {
  test('Simple addition', ({ when, then }) => {
    var result = 0
    when(/^I add (\d+) \+ (\d+)$/, (a, b) => {
      result = parseInt(a) + parseInt(b)
    });

    then(/^the result should be (\d+)$/, (expected) => {
      expect(result).toEqual(parseInt(expected))
    });
  });
})
