Feature: Scenario Outlines
  In order to create a re-usable scenario template driven from a table of examples
  As an engineer
  I would like support for scenario outlines

  Rule: A separate Jest test should be created for each example in a scenario outline

    Scenario: Creating a scenario outline with multiple examples

  Rule: Steps should be matched to step definitions after templating the step with the first example

    Scenario: Scenario outline with the first example matching a step definition
    Scenario: Scenario outline with the second example causing the step to not match any step defs

  Rule: Arguments from the example table should be passed into steps as step arguments

    Scenario: Scenario outline with scenario outline step arguments

  Rule: If a step uses regex capture groups, the capture group arguments should be the first args

    Scenario: Scenario outline step with both scenario outline args and regex capture group args

  Rule: Scenario outline templates in scenario titles should be replaced with the values for each example

    Scenario: Scenario outline with templates in the scenario title

  Rule: Scenario outline templates in docstrings should be replaced with the values for each example

    Scenario: Scenario outline with templates in a docstring

  Rule: Scenario outline templates in table step arguments should be replaced with the values for example

    Scenario: Scenario outline with templates in a table step argument