# Backgrounds

## Overview

Sometimes, all of the scenarios in a feature file end up having one or more steps repeated in every scenario. Jest Cucumber supports the Gherkin Background keyword, with support for both feature-level backgrounds, as well as rule-level backgrounds.

## Feature-level backgrounds

Backgrounds in Jest Cucumber are treated as though the steps in your background scenarios were steps in the scenarios they affect. For example, consider the following Gherkin:

```gherkin
Feature: Arcade coin-op

    Background: Coins are required (not free mode)
        Given my machine is configured to require coins

    Scenario: Successfully inserting coins
        Given I have not inserted any coins
        When I insert one US Quarter
        Then I should have a balance of 25 cents
```

The Gherkin above is treated equivalently to this:

```gherkin
Feature: Arcade coin-op

    Scenario: Successfully inserting coins
        Given my machine is configured to require coins
        Given I have not inserted any coins
        When I insert one US quarter
        Then I should have a balance of 25 cents
```

Background steps are added to your scenarios in the order they appear in your feature file, so if you have 2 backgrounds, for example, then the steps from the first background will be added to the beginning your scenarios before the steps in the second background. This is important, because Jest Cucumber will expect the background step definitions in your `test` to all be definied and to be in the correct order. Otherwise, the normal behavior of throwing errors for missing steps or out of order steps will apply.

## Rule-level backgrounds

With the `Rule` keyword introduced in Gherkin 6, backgrounds are also allowed within rules, which allows for backgrounds that apply only within a particular rule block. Consider the following Gherkin:

```gherkin
Feature: Arcade coin-op

    Rule: When a coin is not recognized as valid, it should be returned

        Background:
            Given my machine is configured to accept US Quarters

        Scenario: Inserting a Canadian coin
            When I insert a Canadian Quarter
            Then my coin should be returned

        Scenario: Inserting a badly damaged coin
            When I insert a US Quarter that is badly damaged
            Then my coin should be returned
```

Similarly to feature-level backgrounds, the Gherkin above is treated equivalently to the following:

```gherkin
Feature: Arcade coin-op

    Rule: When a coin is not recognized as valid, it should be returned

        Scenario: Inserting a Canadian coin
            Given my machine is configured to accept US Quarters
            When I insert a Canadian Quarter
            Then my coin should be returned

        Scenario: Inserting a badly damaged coin
            Given my machine is configured to accept US Quarters
            When I insert a US Quarter that is badly damaged
            Then my coin should be returned
```

In addition, feature-level background steps cascade down to the rule level. Consider the following:

```gherkin
Feature: Arcade coin-op

    Background: Coins are required (not free mode)
        Given my machine is configured to require coins

    Rule: When a coin is not recognized as valid, it should be returned

        Background:
            Given my machine is configured to accept US Quarters

        Scenario: Inserting a Canadian coin
            When I insert a Canadian Quarter
            Then my coin should be returned

        Scenario: Inserting a badly damaged coin
            When I insert a US Quarter that is badly damaged
            Then my coin should be returned
```

Jest Cucumber treats the above as being equivalent to this:

```gherkin
Feature: Arcade coin-op

    Rule: When a coin is not recognized as valid, it should be returned

        Scenario: Inserting a Canadian coin
            Given my machine is configured to require coins
            Given my machine is configured to accept US Quarters
            When I insert a Canadian Quarter
            Then my coin should be returned

        Scenario: Inserting a badly damaged coin
            Given my machine is configured to require coins
            Given my machine is configured to accept US Quarters
            When I insert a US Quarter that is badly damaged
            Then my coin should be returned
```

Again, Jest Cucumber will throw errors if step definitions are not defined for your background steps in each `test` block, or are not defined in the correct order. The ordering of background steps within scenarios in rule blocks is that the feature-level steps come first, followed by the rule-level steps. Background steps at the feature level and rule level are in the order they appear in your feature file, including when you have 2 or more backgrounds at either the feature or rule level.

## Reducing duplicated code

Since the same background steps are repeated in every scenario, and since Jest Cucumber expects the background step definitions to be repeated in every `test` block in the correct order, this could potentially result in a lot of duplicate code. Therefore, the techniques described in ["Reusing Step Definitions"](./ReusingStepDefinitions.md) should be leveraged heavily. See the example [background step definitions](../examples/typescript/specs/step-definitions/backgrounds.steps.ts) for a more concrete illustration.