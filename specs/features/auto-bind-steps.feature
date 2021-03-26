Feature: Auto-bind steps
  In order to replicate the same step definition workflow from Cucumber.js where step definitions are defined once, and the feature file drives scenario execution
  As an engineer
  I would like the ability to automatically bind steps to a set of feature files instead of defining scenarios / rules in my step definition code

  Rule: All feature files matching the glob pattern passed to `autoBindSteps` should be loaded

    Scenario: Feature glob pattern with feature files matched in multiple nested directories

  Rule: All loaded features should be registered with `defineFeature`

    Scenario: Feature files registered with `autoBindSteps`

  Rule: All rules within every feature should be automatically registered

    Scenario: Feature files with rules registered with `autoBindSteps`

  Rule: All scenarios within every feature and rule should automatically be registered

    Scenario: Feature files with rules and scenarios registered with `autoBindSteps`

  Rule: If a step in a feature file matches a step registered via `autoBindSteps`, it should be bound to that step in that scenario

    Scenario: Step in feature file matches a step definition

  Rule: If a step in a feature file matches more than one step registered with `autoBindSteps`, a validation error should occur

    Scenario: Step in a feature file matches more than one step definition

  Rule: If a step in a feature file matches no steps registered with `autoBindSteps`, then a validation error should occur 
        and suggested step code should be generated.

    Scenario: Step in a feature file with no matching step definitions