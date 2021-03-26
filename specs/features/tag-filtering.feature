Feature: Tag filtering
  In order to have fine-grained control over which features and scenarios run in Jest Cucumber
  As an engineer
  I would like the ability to tag write expressions to filter scenarios by tag

  Rule: If a tag expression is configured, only scenarios with tags matching the tag expression should be executed

    Scenario: Scenario with a tag matching the configured tag expression
    Scenario: Scenario with a tag not matching the configured tag expression

  Rule: Validation rules should be ignored for any scenarios not matching a tag expression

    Scenario: Scenario with no step definitions not matching the configured tag expression    

  Rule: Feature tags should be applied to all scenarios in the feature, ignoring rules because tags on rules is not valid Gherkin

    Scenario: Scenario has no tags matching tag expression, but feature does