Feature: Validation and code generation
  In order to ensure that my feature files and step definitions stay in sync
  As an engineer
  I would like a configurable option to see validation errors and step definition suggestions when feature files and step definitions are out of sync

  Rule: Whether or not validation errors occur and code is generated for rules, scenarios, and steps being defined in the feature and not
        in the step definitions depends on the combination of settings for `missingRuleInStepDefinitions`, `missingScenarioInStepDefinitions`,
        and `missingStepInStepDefinitions`.

    Scenario Outline: Validation errors + code generation for rules, scenarios, and steps in feature file, but not in step definitions
      Given `missingRuleInStepDefinitions` is <missingRuleInStepDefinitions>
      And `missingScenarioInStepDefinitions` is <missingScenarioInStepDefinitions>
      And `missingStepInStepDefinitions` is <missingStepInStepDefinitions>
      And I <haveAMissingRule> in my step definitions
      And I <haveAMissingScenario> in my step definitions
      And I <haveAMissingStep> in my step definitions
      When I run my Jest Cucumber tests
      Then I should see <missingRuleErrorAndCode> for a missing rule
      And I should see <missingRuleErrorAndCode> for a missing scenario
      And I should see <missingSteprrorAndCode> for a missing step

      Examples: Missing rule in step definitions
      | missingRuleInStepDefinitions | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingRule | haveAMissingScenario | haveAMissingStep | missingRuleErrorAndCode | missingScenarioErrorAndCode | missingSteprrorAndCode |
      | enabled                      | enabled                          | enabled                      | true             | false                | false            | true                    | false                       | false                  |
      | enabled                      | enabled                          | disabled                     | true             | false                | false            | true                    | false                       | false                  |
      | enabled                      | disabled                         | disabled                     | true             | false                | false            | true                    | false                       | false                  |
      | disabled                     | enabled                          | enabled                      | true             | false                | false            | false                   | false                       | false                  |

      Examples: Missing scenario in step definitions
      | missingRuleInStepDefinitions | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingRule | haveAMissingScenario | haveAMissingStep | missingRuleErrorAndCode | missingScenarioErrorAndCode | missingSteprrorAndCode |
      | enabled                      | enabled                          | enabled                      | false            | true                 | false            | false                   | true                        | false                  |
      | enabled                      | enabled                          | disabled                     | false            | true                 | false            | false                   | true                        | false                  |
      | disabled                     | enabled                          | disabled                     | false            | true                 | false            | false                   | true                        | false                  |
      | enabled                      | disabled                         | enabled                      | false            | true                 | false            | false                   | true                        | false                  |
      | enabled                      | disabled                         | disabled                     | false            | true                 | false            | false                   | false                       | false                  |

      Examples: Missing step in step definitions
      | missingRuleInStepDefinitions | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingRule | haveAMissingScenario | haveAMissingStep | missingRuleErrorAndCode | missingScenarioErrorAndCode | missingSteprrorAndCode |
      | enabled                      | enabled                          | enabled                      | false            | false                | true             | false                   | true                        | true                   |
      | disabled                     | enabled                          | enabled                      | false            | false                | true             | false                   | true                        | true                   |
      | enabled                      | disabled                         | enabled                      | false            | false                | true             | false                   | true                        | true                   |
      | disabled                     | disabled                         | enabled                      | false            | false                | true             | false                   | true                        | true                   |
      | enabled                      | enabled                          | disabled                     | false            | false                | true             | false                   | false                       | false                  |

  Rule: Whether or not validation errors occur for rules, scenarios, and steps being defined in the step definitions and not
        in the feature file depends on the combination of settings for `missingRuleInFeature`, `missingScenarioInFeature`,
        and `missingStepInFeature`. Code generation is not relevant in these cases.

    Scenario Outline: Validation errors for rules, scenarios, and steps defined in the step definitions, but not in the feature file
      Given `missingRuleInFeature` is <missingRuleInFeature>
      And `missingScenarioInFeature` is <missingScenarioInFeature>
      And `missingStepInFeature` is <missingStepInFeature>
      And I <haveAMissingRule> in my feature file
      And I <haveAMissingScenario> in my feature file
      And I <haveAMissingStep> in my feature file
      When I run my Jest Cucumber tests
      Then I should see <missingRuleErrorAndCode> for a missing rule
      And I should see <missingRuleErrorAndCode> for a missing scenario
      And I should see <missingSteprrorAndCode> for a missing step

      Examples: Missing rule in step definitions
      | missingRuleInStepDefinitions | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingRule | haveAMissingScenario | haveAMissingStep | missingRuleErrorAndCode | missingScenarioErrorAndCode | missingSteprrorAndCode |
      | enabled                      | enabled                          | enabled                      | true             | false                | false            | true                    | false                       | false                  |
      | enabled                      | enabled                          | disabled                     | true             | false                | false            | true                    | false                       | false                  |
      | enabled                      | disabled                         | disabled                     | true             | false                | false            | true                    | false                       | false                  |
      | disabled                     | enabled                          | enabled                      | true             | false                | false            | false                   | false                       | false                  |

      Examples: Missing scenario in step definitions
      | missingRuleInStepDefinitions | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingRule | haveAMissingScenario | haveAMissingStep | missingRuleErrorAndCode | missingScenarioErrorAndCode | missingSteprrorAndCode |
      | enabled                      | enabled                          | enabled                      | false            | true                 | false            | false                   | true                        | false                  |
      | enabled                      | enabled                          | disabled                     | false            | true                 | false            | false                   | true                        | false                  |
      | disabled                     | enabled                          | disabled                     | false            | true                 | false            | false                   | true                        | false                  |
      | enabled                      | disabled                         | enabled                      | false            | true                 | false            | false                   | true                        | false                  |
      | enabled                      | disabled                         | disabled                     | false            | true                 | false            | false                   | false                       | false                  |

      Examples: Missing step in step definitions
      | missingRuleInStepDefinitions | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingRule | haveAMissingScenario | haveAMissingStep | missingRuleErrorAndCode | missingScenarioErrorAndCode | missingSteprrorAndCode |
      | enabled                      | enabled                          | enabled                      | false            | false                | true             | false                   | true                        | true                   |
      | disabled                     | enabled                          | enabled                      | false            | false                | true             | false                   | true                        | true                   |
      | enabled                      | disabled                         | enabled                      | false            | false                | true             | false                   | true                        | true                   |
      | disabled                     | disabled                         | enabled                      | false            | false                | true             | false                   | true                        | true                   |
      | enabled                      | enabled                          | disabled                     | false            | false                | true             | false                   | false                       | false                  |

  Rule: When `missingStepInStepDefinitions` is enabled, the ordering of steps in the step definitions must exactly match the feature file

    Scenario: Steps in the correct order
    Scenario: Steps out of order

  Rule: When the same rule description is used twice in the same feature, a validation error should occur

    Scenario: Same rule defined twice in the same feature
    Scenario: Same rule defined in different features

  Rule: When the same scenario description appears twice in a step definitions and are not under different rules, a validation error should occur

    Scenario: Same scenario appears twice in a feature files

  Rule: When the same scenario description appears under different rules in the step definitions, no validation errors should occur

    Scenario: Same scenario under different rules in step definitions

  Rule: When the same scenario description appears twice under the same rule in the step definitions, a validation error should occur

    Scenario: Same scenario under same rule in step definitions

  Rule: When using the previous `defineFeature` call signature that doesn't support rules and the same scenario description appears twice 
        in the same feature, a validation error should occur.

    Scenario: Same scenario under different rules in the feature file, but rules not used in step definitions

  Rule: When validating that rules in step definitions and feature files match, newlines and extra spaces should be ignored

    Scenario: Rule with differences in newlines and extra spaces in feature file and step definitions

  Rule: Scenario ordering is not enforced

    Scenario: Scenario ordering is different between feature file and step definitions

  Rule: The ordering of rules is not enforced

    Scenario: Rule ordering is different between feature file and step definitions