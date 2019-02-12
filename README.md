# Jest Cucumber

Execute Gherkin scenarios in Jest

[![Build Status](https://travis-ci.org/bencompton/jest-cucumber.svg?branch=master)](https://travis-ci.org/bencompton/jest-cucumber) [![Greenkeeper badge](https://badges.greenkeeper.io/bencompton/jest-cucumber.svg)](https://greenkeeper.io/)
[![npm downloads](https://img.shields.io/npm/dm/jest-cucumber.svg?style=flat-square)](https://www.npmjs.com/package/jest-cucumber)

<img src="./images/jest-cucumber-demo.gif?raw=true" alt="Cucumber Jest Demo" />

## Overview

jest-cucumber is an alternative to [Cucumber.js](https://github.com/cucumber/cucumber-js) that runs on top on [Jest](https://jestjs.io). Instead of using `describe` and `it` blocks, you instead write a Jest test for each scenario, and then define `Given`, `When`, and `Then` step definitions inside of your Jest tests. jest-cucumber then allows you to link these Jest tests to your feature files and ensure that they always [stay in sync](https://github.com/bencompton/jest-cucumber/blob/master/docs/AdditionalConfiguration.md#disabling-scenario--step-definition-validation).

## Motivation

Jest is an excellent test runner with great features like parallel test execution, mocking, snapshots, code coverage, etc. If you're using VS Code, there's also a terrific [Jest extension](https://github.com/jest-community/vscode-jest) that allows you get realtime feedback as you're writing your tests and easily debug failing tests individually. [Cucumber](https://cucumber.io) is a popular tool for doing [Acceptance Test-Driven Development](https://en.wikipedia.org/wiki/Acceptance_test–driven_development) and creating business-readable executable specifications. This library aims to achieve the best of both worlds, and even run your unit tests and acceptance tests in the same test runner.

## Getting Started

### Install Jest Cucumber:

```
npm install jest-cucumber --save-dev
```

### Add a Feature file:

```gherkin
Feature: Rocket Launching

Scenario: Launching a SpaceX rocket
  Given I am Elon Musk attempting to launch a rocket into space
  When I launch the rocket
  Then the rocket should end up in space
  And the booster(s) should land back on the launch pad
  And nobody should doubt me ever again
```

### Add the following to your Jest configuration:

```javascript  
  "testMatch": [
    "**/*.steps.js"
  ],
```

### Add a step definition file that links to your feature file:

```javascript
//rocket-launching.steps.js

import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('./features/RocketLaunching.feature');
```

### Add a Jest test for each scenario into your step definition file:

```javascript
//rocket-launching.steps.js

    import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('./features/RocketLaunching.feature');

defineFeature(feature, test => {
  test('Launching a SpaceX rocket', ({ given, when, then }) => {

  });
});
```

### Add step definitions to your scenario Jest tests:

```javascript
//rocket-launching.steps.js

import { defineFeature, loadFeature } from 'jest-cucumber';
import Rocket from '../Rocket';

const feature = loadFeature('./features/RocketLaunching.feature');

defineFeature(feature, test => {
  test('Launching a SpaceX rocket', ({ given, when, then }) => {
    let rocket;

    given('I am Elon Musk attempting to launch a rocket into space', () => {
      rocket = new Rocket();
    });

    when('I launch the rocket', () => {
      rocket.launch();
    });

    then('the rocket should end up in space', () => {
      expect(rocket.isInSpace).toBe(true);
    });

    then('the booster(s) should land back on the launch pad', () => {
      expect(rocket.boostersLanded).toBe(true);
    });

    then('nobody should doubt me ever again', () => {
      expect('people').not.toBe('haters');
    });
  });
});
```
## Additional Documentation

  * [Gherkin tables](./docs/GherkinTables.md)
  * [Step definition arguments](./docs/StepDefinitionArguments.md)
  * [Scenario outlines](./docs/ScenarioOutlines.md)
  * [Re-using step definitions](./docs/ReusingStepDefinitions.md)  
  * [Configuration options](./docs/AdditionalConfiguration.md)
  * [Running the examples](./docs/RunningTheExamples.md)
