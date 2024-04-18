# Jest Cucumber

Execute Gherkin scenarios in Jest

[![Build](https://github.com/bencompton/jest-cucumber/actions/workflows/build.yaml/badge.svg?branch=master)](https://github.com/bencompton/jest-cucumber/actions/workflows/build.yaml)
[![](https://img.shields.io/npm/v/jest-cucumber)](https://www.npmjs.com/package/jest-cucumber)
[![npm downloads](https://img.shields.io/npm/dm/jest-cucumber.svg?style=flat-square)](https://www.npmjs.com/package/jest-cucumber)

<img src="./images/jest-cucumber-demo.gif?raw=true" alt="Cucumber Jest Demo" />

## Overview

jest-cucumber is an alternative to [Cucumber.js](https://github.com/cucumber/cucumber-js) that runs on top on [Jest](https://jestjs.io). Instead of using `describe` and `it` blocks, you instead write a Jest test for each scenario, and then define `Given`, `When`, and `Then` step definitions inside of your Jest tests. jest-cucumber then allows you to link these Jest tests to your feature files and ensure that they always [stay in sync](https://github.com/bencompton/jest-cucumber/blob/master/docs/AdditionalConfiguration.md#disabling-scenario--step-definition-validation).

## Motivation

Jest is an excellent test runner with great features like parallel test execution, mocking, snapshots, code coverage, etc. If you're using VS Code, there's also a terrific [Jest extension](https://github.com/jest-community/vscode-jest) that allows you get realtime feedback as you're writing your tests and easily debug failing tests individually. [Cucumber](https://cucumber.io) is a popular tool for doing [Acceptance Test-Driven Development](https://en.wikipedia.org/wiki/Acceptance_test–driven_development) and creating business-readable executable specifications. This library aims to achieve the best of both worlds, and even run your unit tests and acceptance tests in the same test runner.

## Getting Started

### Install Jest Cucumber:

```
npm install jest jest-cucumber --save-dev
```

### Add a Feature file:

```gherkin
Feature: Logging in

Scenario: Entering a correct password
    Given I have previously created a password
    When I enter my password correctly
    Then I should be granted access
```

### Add the following to your Jest configuration:

```javascript
  "testMatch": [
    "**/*.steps.js"
  ],
```

### Add a step definition file that links to your feature file:

```javascript
// logging-in.steps.js

import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('features/LoggingIn.feature');
```

### Add a Jest test for each scenario into your step definition file:

```javascript
// logging-in.steps.js

import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('features/LoggingIn.feature');

defineFeature(feature, test => {
  test('Entering a correct password', ({ given, when, then }) => {

  });
});
```

### Add step definitions to your scenario Jest tests:

```javascript
// logging-in.steps.js

import { loadFeature, defineFeature } from 'jest-cucumber';
import { PasswordValidator } from 'src/password-validator';

const feature = loadFeature('specs/features/basic-scenarios.feature');

defineFeature(feature, (test) => {
  let passwordValidator = new PasswordValidator();
  let accessGranted = false;

  beforeEach(() => {
    passwordValidator = new PasswordValidator();
  });

  test('Entering a correct password', ({ given, when, then }) => {
    given('I have previously created a password', () => {
      passwordValidator.setPassword('1234');
    });

    when('I enter my password correctly', () => {
      accessGranted = passwordValidator.validatePassword('1234');
    });

    then('I should be granted access', () => {
      expect(accessGranted).toBe(true);
    });
  });
});
```

## Additional Documentation

* [Asynchronous steps](./docs/AsynchronousSteps.md)
* [Automatic step Binding](./docs/AutomaticStepBinding.md)
* [Backgrounds](./docs/Backgrounds.md)
* [Configuration options](./docs/AdditionalConfiguration.md)
* [Contributing](./CONTRIBUTING.md)
* [Gherkin tables](./docs/GherkinTables.md)
* [Re-using step definitions](./docs/ReusingStepDefinitions.md)
* [Running the examples](./docs/RunningTheExamples.md)
* [Running with another test runner](./docs/RunWithAnotherTestRunner.md)
* [Scenario outlines](./docs/ScenarioOutlines.md)
* [Step definition arguments](./docs/StepDefinitionArguments.md)
* [Using Docstrings](./docs/UsingDocstrings.md)

## FAQ

#### Why doesn't this library work exactly like Cucumber and how do I avoid duplicated step code?

If you prefer an experience more like Cucumber with global step matching and the ability to define steps exactly once that can be matched to multiple steps across multiple feature files, then Jest Cucumber does accommodate this preference with [autoBindSteps](./docs/AutomaticStepBinding.md).

However, the default mode in Jest Cucumber can be thought of as Cucumber reimagined for Jest, and is designed for writing Jest tests that are kept in sync with Gherkin feature files. The goal is that your Jest tests (i.e., step definitions) are perfectly readable by themselves without jumping back and forth between step definitions and feature files. Another goal is to avoid global step matching, which many people find problematic and difficult to maintain as a codebase grows. By default, Jest Cucumber expects that your step definitions and feature files match exactly, and will report errors / generate suggested code when they are out of sync. To avoid duplicated step code, you can use the techniques described [here](./docs/ReusingStepDefinitions.md).
