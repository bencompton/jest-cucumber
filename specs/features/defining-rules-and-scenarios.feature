Feature: Defining rules and scenarios
  In order to improve the readability of my step definitions 
  As an engineer
  I would like the ability to define rules and scenarios within my step definitions

  Rule: When using the new call signature for `defineFeature` to define rules in step definitions, it should create a Jest `describe` block
        for the rule with a Jest test for each scenario defined under the rule.

    Scenario: Defining a rule with scenarios in the step definitions

  Rule: The call new signature for `defineFeature` still supports scenarios not under a rule in a feature file, in which case, they appear in 
        the feature `describe` block.

    Scenario: Using the new `defineFeature` call signature to define a scenario not under a rule

  Rule: When using the old call signature for `defineFeature` to define scenarios, the scenarios should be defined as a Jest test, and
        grouped under the feature describe block, even if they are defined under rules in the feature files

    Scenario: Using the old `defineFeature` call signature to define a scenario that has a rule in the feature file
    Scenario: Using the old `defineFeature` call signature to define a scenario that does not have a rule in the feature file