Feature: Validation and code generation
  In order to ensure that my feature files and step definitions stay in sync
  As an engineer
  I would like a configurable option to see validation errors and step definition suggestions when feature files and step definitions are out of sync

  Rule: Scenario counts and titles must match between feature files and step definitions if `scenariosMustMatchFeatureFile` is enabled

    Scenario: Enabled and scenario missing step definitions
      Given `scenariosMustMatchFeatureFile` is enabled
      And a scenario in a feature file has no step definitions
      When I run my Jest Cucumber tests
      Then I should see a validation error / generated code

    Scenario: Disabled and scenario missing step definitions
      Given `scenariosMustMatchFeatureFile` is disabled
      And a scenario in a feature file has no step definitions
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code

    Scenario: Enabled and scenario filtered via tag filter
      Given `scenariosMustMatchFeatureFile` is enabled
      And a scenario in a feature file has no step definitions
      And that scenario is filtered via a tag filter
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code

  Rule: Scenario ordering does not matter

    Scenario: Scenario order is the same
      Given `scenariosMustMatchFeatureFile` is enabled
      And a set of scenarios is ordered the same in the feature / step definitions
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code

    Scenario: Scenario order is different
      Given `scenariosMustMatchFeatureFile` is enabled
      And a set of scenarios is ordered the differently in the feature / step definitions
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code

  Rule: The step order and step count must match between the step definitions and feature file if `stepsMustMatchFeatureFile` is enabled

    Scenario: Enabled and step order / count are the same
      Given `stepsMustMatchFeatureFile` is enabled
      And the step definitions exactly match the feature file
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code

    Scenario: Enabled and step order is different
      Given `stepsMustMatchFeatureFile` is enabled
      And the step order differs between the feature / step definitions
      When I run my Jest Cucumber tests
      Then I should see a validation error / generated code

    Scenario: Enabled and step count is different
      Given `stepsMustMatchFeatureFile` is enabled
      And the step count differs between the feature / step definitions
      When I run my Jest Cucumber tests
      Then I should see a validation error / generated code

    Scenario: Disabled and step order is different
      Given `stepsMustMatchFeatureFile` is disabled
      And the step order differs between the feature / step definitions
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code

    Scenario: Disabled and step count is different
      Given `stepsMustMatchFeatureFile` is disabled
      And the step count differs between the feature / step definitions
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code    

  Rule: All steps in a scenario must be matched by step matchers in the step definitions if `stepsMustMatchFeatureFile` is enabled

    Scenario: Enabled and a step in the step definitions doesn't match the step in the feature
      Given `stepsMustMatchFeatureFile` is enabled
      And I have a scenario where the step matcher for the second step doesn't match the step
      When I run my Jest Cucumber tests
      Then I should see a validation error / generated code

    Scenario: Disabled and a step in the step definitions doesn't match the step in the feature
      Given `stepsMustMatchFeatureFile` is disabled
      And I have a scenario where the step matcher for the second step doesn't match the step
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code

    # Use case described in #111
    Scenario: Scenario with no steps
      Given `stepsMustMatchFeatureFile` is disabled 
      And I have a scenario with no steps
      When I run my Jest Cucumber tests
      Then I should not see a validation error / generated code

  Rule: If `allowScenariosNotInFeatureFile` is enabled, the step definitions can have scenarios not in the feature file

    Scenario: Enabled and step definitions have an extra scenario
      Given `allowScenariosNotInFeatureFile` is enabled
      And there is an extra scenario in my step definitions not in my feature file
      When I run my Jest Cucumber tests
      Then I should not see a validation error

    Scenario: Disabled and step definitions have an extra scenario
      Given `allowScenariosNotInFeatureFile` is disabled
      And there is an extra scenario in my step definitions not in my feature file
      When I run my Jest Cucumber tests
      Then I should see a validation error









  # Rule: Whether or not validation errors occur and code is generated for scenarios and steps being defined in the feature and not
  #       in the step definitions depends on the combination of settings for `missingScenarioInStepDefinitions`, and `missingStepInStepDefinitions`.

  #   Scenario Outline: Validation errors + code generation for scenarios, and steps in feature file, but not in step definitions
  #     Given `missingScenarioInStepDefinitions` is <missingScenarioInStepDefinitions>
  #     And `missingStepInStepDefinitions` is <missingStepInStepDefinitions>
  #     And I <haveAMissingScenario> in my step definitions
  #     And I <haveAMissingStep> in my step definitions
  #     And I <haveAMismatchedStep> in my step definitions
  #     When I run my Jest Cucumber tests
  #     Then I should see the <errorType> error and code generated

  #     Examples: Missing scenario in step definitions
  #     | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingScenario | haveAMissingStep | haveAMismatchedStep | errorType       |
  #     | enabled                          | enabled                      | true                 | false            | false               | scenarioMissing |
  #     | enabled                          | disabled                     | true                 | false            | false               | scenarioMissing |
  #     | disabled                         | enabled                      | true                 | false            | false               | none            |
  #     | disabled                         | disabled                     | true                 | false            | false               | none            |
      
  #     Examples: Missing step in step definitions
  #     | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingScenario | haveAMissingStep | haveAMismatchedStep | errorType         |
  #     | enabled                          | enabled                      | false                | true             | false               | stepCountMismatch |
  #     | enabled                          | disabled                     | false                | true             | false               | none              |
  #     | disabled                         | enabled                      | false                | true             | false               | stepCountMismatch |
  #     | disabled                         | disabled                     | false                | true             | false               | none              |

  #     Examples: Step in step definitions slightly different from feature file
  #     | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingScenario | haveAMissingStep | haveAMismatchedStep | errorType    |
  #     | enabled                          | enabled                      | false                | false            | true                | stepMismatch |
  #     | enabled                          | disabled                     | false                | false            | true                | none         |
  #     | disabled                         | enabled                      | false                | false            | true                | stepMismatch |
  #     | disabled                         | disabled                     | false                | false            | true                | none         |

  # Rule: Whether or not validation errors occur for scenarios, and steps being defined in the step definitions and not
  #       in the feature file depends on the combination of settings for `missingScenarioInFeature` and `missingStepInFeature`. Code generation is not relevant in these cases.

  #   Scenario Outline: Validation errors for scenarios and steps defined in the step definitions, but not in the feature file
  #     Given `missingScenarioInFeature` is <missingScenarioInFeature>
  #     And `missingStepInFeature` is <missingStepInFeature>
  #     And I <haveAMissingScenario> in my feature file
  #     And I <haveAMissingStep> in my feature file
  #     When I run my Jest Cucumber tests
  #     Then I should see the <missingScenarioOrStepError> error

  #     Examples: Missing scenario in feature file
  #     | missingScenarioInFeature | missingStepInFeature | haveAMissingScenario | haveAMissingStep | missingScenarioOrStepError |
  #     | enabled                  | enabled              | true                 | false            | scenarioMissing            |
  #     | enabled                  | disabled             | true                 | false            | scenarioMissing            |
      # | disabled                         | enabled                      | true                 | false            | none                       |
      # | disabled                         | disabled                     | true                 | false            | none                       |

      # Examples: Missing step in feature file
      # | missingScenarioInStepDefinitions | missingStepInStepDefinitions | haveAMissingScenario | haveAMissingStep | missingScenarioOrStepError |
      # | enabled                          | enabled                      | false                | true             | stepMissing                |
      # | enabled                          | disabled                     | false                | true             | stepMissing                |
      # | disabled                         | enabled                      | false                | true             | none                       |
      # | disabled                         | disabled                     | false                | true             | none                       |

  # Rule: When `missingStepInStepDefinitions` is enabled, the ordering of steps in the step definitions must exactly match the feature file

  #   Scenario: Steps in the correct order
  #   Scenario: Steps out of order

  # Rule: When the same scenario description appears twice in a step definitions and are not under different rules, a validation error should occur

  #   Scenario: Same scenario appears twice in a feature files

  # Rule: Scenario ordering is not enforced

  #   Scenario: Scenario ordering is different between feature file and step definitions