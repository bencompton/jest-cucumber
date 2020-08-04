# Automatic step binding

## Overview

By default, Jest Cucumber expects that you will define each of your scenarios in a Jest-centric manner like so:

```javascript
// specs/step-definitions/vending-machine.steps.ts

const feature = loadFeature('specs/features/beverage-vending-machine.feature');

defineFeature(feature, (test) => {
    let vendingMachine: VendingMachine;    

    test('Purchasing a beverage', ({ given, and when, then }) => {
        given(/^the vending machine has "(.*)" in stock$/, (itemName: string) => {
            vendingMachine = new VendingMachine();
            vendingMachine.stockItem(itemName, 1);
        });

        and('I have inserted the correct amount of money', () => {
            vendingMachine.insertMoney(0.50);
        });

        when(/^I purchase "(.*)"$/, (itemName: string) => {
            vendingMachine.dispenseItem(itemName);
        });

        then(/^my "(.*)" should be dispensed$/, (itemName: string) => {
            const inventoryAmount = vendingMachine.items[itemName];
            expect(inventoryAmount).toBe(0);
        });
    });
});
```

This enables idiomatic Jest tests that are kept in sync with business-readable feature files, and you can minimize code duplication with the techniques described in ["Reusing Step Definitions"](./ReusingStepDefinitions.md).

However, some people prefer more idiomatic Cucumber behavior rather than the default Jest-centric approach. With Cucumber, instead of creating test code for every scenario, only step definitions are defined that can potentially be matched with any step in any feature file. Jest Cucumber provides the `autoBindSteps` utility function to accommodate this preference.

## Getting started

With the automatic step binding approach, your step definitions are defined within functions like so:

```javascript
// specs/step-definitions/vending-machine-steps.ts

import { StepDefinitions } from 'jest-cucumber';

import { VendingMachine } from '../src/vending-machine';

export const vendingMachineSteps: StepDefinitions = ({ given, and, when, then }) => {
    let vendingMachine: VendingMachine;

    given(/^the vending machine has "(.*)" in stock$/, (itemName: string) => {
        vendingMachine = new VendingMachine();
        vendingMachine.stockItem(itemName, 1);
    });

    and('I have inserted the correct amount of money', () => {
        vendingMachine.insertMoney(0.50);
    });

    when(/^I purchase "(.*)"$/, (itemName: string) => {
        vendingMachine.dispenseItem(itemName);
    });

    then(/^my "(.*)" should be dispensed$/, (itemName: string) => {
        const inventoryAmount = vendingMachine.items[itemName];
        expect(inventoryAmount).toBe(0);
    });
};
```

Then, within any code file that gets executed via Jest's `testMatch` configuration, you import your feature files and call `autoBindSteps`:

```javascript
import { loadFeatures, autoBindSteps } from 'jest-cucumber';

import { vendingMachineSteps } from 'specs/step-definitions/vending-machine-steps';

const features = loadFeatures('specs/features/**/*.feature');
autoBindSteps(features, [ vendingMachineSteps ]);
```

If you wanted to use only the auto binding approach in your project and have Jest Cucumber work similarly to Cucumber.js, you might have the code above in a single `jest-cucumber-setup.ts` file that imports all of your feature files and step definitions and binds them together. Your Jest configuration would look something like this:

```javascript
  "jest": {
    ...
    "testMatch": [
      "**/jest-cucumber-setup.ts"
    ],
```

If you are using `autoBindSteps` with just a subset of your feature files (as demonstrated in the [examples](https://github.com/bencompton/jest-cucumber/blob/master/examples/typescript/specs/step-definitions/auto-step-binding.steps.ts)), you could place your `loadFeatures` and `autoBindSteps` code into any `.steps.ts` file and use the typical Jest Cucumber `testMatch` configuration:

```javascript
  "jest": {
    ...
    "testMatch": [
      "**/*.steps.ts"
    ],
```

## How it works

`loadFeatures` and `autoBindSteps` are utility functions that automate what you would normally do per feature file by calling `loadFeature`, then `defineFeature`, and then defining one `test` per scenario containing inline step definitions.

`loadFeatures` will load multiple feature files specified in your glob pattern and `autoBindSteps` will loop through every feature file, calling `defineFeature` for each one. It will then call `test` for each scenario within each feature file, and will loop through the steps in each scenario, attempting to match the steps with with one of the step definitions within the functions you are binding. If no matching step definition is found for a particular step, or more than one matching step definition is found, errors will occur.
