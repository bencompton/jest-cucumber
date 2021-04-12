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