Feature: Step matching
  In order to 
  As an engineer
  I would like the ability to link step definitions to my feature file via plain strings or regular expressions

  Rule: A step definition with a plain string should exactly match the corresponding step in the feature file and produce no step arguments

    Scenario: Step definition with plain string
      Given a step matched with a plain string in a step definition
      When I run my Jest Cucumber tests
      Then the step should match correctly
      And no step arguments should be passed to the step definition

  Rule: Step definitions can use regular expressions, and the value of each capture group should be passed in as string-valued step arguments

    Scenario: Regex step definition with 2 capture groups
      Given a step matched with a regex that has 2 capture groups
      When I run my Jest Cucumber tests
      Then the step should match correctly
      And 2 step arguments should be passed to the step definition