Feature: Step matching
  In order to 
  As an engineer
  I would like the ability to link step definitions to my feature file via plain strings or regular expressions

  Rule: A step definition with a plain string should exactly match the corresponding step in the feature file and produce no step arguments

    Scenario: Step definition with plain string

  Rule: Step definitions can use regular expressions, and the value of each capture group should be passed in as string-valued step arguments

    Scenario: Regex step definition with 2 capture groups