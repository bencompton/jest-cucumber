Feature: Table step arguments

  Rule: When a step definition has a table step argument, the table argument should be an array with one object per table row,
        with each object key corresponding to a table columns and each value being that row's value for that column.

    Scenario: Step definition with a table argument
      Given a step with a table argument
      When I run my Jest Cucumber tests
      Then my step definitions should get an argument with array of table row objects

  Rule: When a step definition is using regex capture groups and a table, the table should be the last step argument

    Scenario: Step definition with regex capture groups and a table argument
      Given a step with a table argument / 2 regex capture groups
      When I run my Jest Cucumber tests
      Then the first 2 arguments should be the regex capture groups
      And the third argument should be the array of table row objects