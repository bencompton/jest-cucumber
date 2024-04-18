import { loadFeature, setJestCucumberConfiguration } from '../src';

describe('loadFeature', () => {
  it('should not throw an exception when loadFeature is called with loadRelativePath set to true in the global configuration', () => {
    setJestCucumberConfiguration({
      loadRelativePath: true,
    });

    let hasException = false;
    try {
      loadFeature('./features/auto-bind-steps.feature');
    } catch (e) {
      hasException = true;
    }

    expect(hasException).toBeFalsy();
  });
});
