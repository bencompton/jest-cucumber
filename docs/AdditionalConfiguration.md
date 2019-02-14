# Configuration Options

## Disabling scenario / step definition validation

Cucumber's approach is to start with your feature file and execute the step definitions in the order defined in the feature file. In contrast, jest-cucumber scenarios are merely Jest tests. In order to provide the same ability as Cucumber to keep the feature files and step definitions in sync, jest-cucumber validates your step definitions against the feature file.

By default, this step definition / feature file validation is enabled. If you have scenarios that are defined in the feature file, but not in your step definitions for that feature file, jest-cucumber will raise an error (and provide starter code). If you have scenarios defined in your step definitions for that aren't in your feature file, jest-cucumber will also raise an error. Additionally, jest-cucumber also validates that the steps you define within your scenarios match the steps that are defined in the feature file, and are in the same order. 

If you would prefer not to have more control over what validation occurs the following options are available:

```javascript
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('./features/RocketLaunching.feature', {
  errors: {
    missingScenarioInStepDefinitions: true, // Error when a scenario is in the feature file, but not in the step definition
    missingStepInStepDefinitions: true, // Error when a step is in the feature file, but not in the step definitions
    missingScenarioInFeature: true, // Error when a scenario is in the step definitions, but not in the feature
    missingStepInFeature: true, // Error when a step is in the step definitions, but not in the feature
  }
});
```

## Tag filtering

jest-cucumber has the ability to specify a tag filter. Tag filters will cause jest-cucumber to skip any scenario that is filtered out via a tag filter.

For example, consider the following feature file:

```gherkin
Feature: Tagged scenarios

  @included
  Scenario: Tagged scenario that is included
    Given my scenario has a tag that is included in my jest-cucumber step definitions tag filter
    But I don't have that scenario defined in my step definitions
    When I execute my jest-cucumber scenarios
    Then jest-cucumber should show me an error
  
  @excluded
  Scenario: Tagged scenario that is not included
    Given my scenario has a tag that is NOT included in my jest-cucumber step definitions tag filter
    But I don't have that scenario defined in my step definitions
    When I execute my jest-cucumber scenarios
    Then jest-cucumber should NOT show me an error
```

Consider the following step definitions file:

```javascript
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('./features/RocketLaunching.feature', {
  tagFilter: '@included and not @excluded'
});

...
...
...
```

In this case, jest-cucumber will run the scenario tagged `@included`, and will skip the scenario tagged `@excluded`. The tag filtering expressions are very powerful and can include `not`, `and`, `or`, as well as parenthesis.

## Scenario title templates

In some cases, having more control over the scenario titles is desired. For example, imagine scenarios that are tagged with with issue ids like so:

```
Feature: Tagged scenarios

    @issue-1234
    Scenario: Scenario tagged with issue
        ...
        ...
        ...        
```

Jest Cucumber allows a `scenarioNameTemplate` function to be provided to generate the scenario title as desired. For example:

```javascript
const feature = loadFeature('./examples/typescript/specs/features/basic-scenarios.feature', {
    scenarioNameTemplate: (vars) => {
        return `${vars.scenarioTitle} (${vars.scenarioTags.join(',')})`;
    }
});
```

The output scenario title in this case would be `Scenario tagged with issue (issue-1234)`.

The following info is available in the `vars` argument:

* `featureTitle` - string
* `featureTags` - string[]
* `scenarioTitle` - string
* `scenarioTags` - string[]

## Relative feature file paths

It might feel more natural to load feature files with paths relative to the file loading the feature, instead of relative to the project root. This is possible with help of the `loadRelativePath` flag:

```javascript
const feature = loadFeature('../features/basic-scenarios.feature', { loadRelativePath: true });
```

Please note that the path will be relative to the file that calls `loadFeature`, so if you use helper files which call `loadFeature` for you this might lead to unexpected results.
Like all other flags you can set the flag globally to always use relative imports.

## Global configuration

To avoid repeating the same configuration settings in every step definition file, it is also possible to specify configuration parameters globally. Note that configuration settings specified in step definition files take precedence over global configuration.

To enable global configuration, first specify a configuration JavaScript file in your the `setupFiles` section of your Jest configuration like so:

```javascript
{
  ...
  "setupFiles": [
    "./jest-cucumber-config"
  ],
  ...
}
```

Your configuration JavaScript file should look like so:

```javascript
//jest-cucumber-config.js

const setJestCucumberConfiguration = require('jest-cucumber').setJestCucumberConfiguration;

setJestCucumberConfiguration({
  tagFilter: '@ui and not @slow',
  scenarioNameTemplate: (vars) => {
      return ` ${vars.featureTitle} - ${vars.scenarioTitle}}`;
  }
});
```
