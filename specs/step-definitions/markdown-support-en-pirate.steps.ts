import { loadFeature, defineFeature, DefineStepFunction } from '../../src';

const feature = loadFeature('./specs/features/markdown-support.en-pirate.feature.md',{
  dialect: 'en-pirate'
});

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
