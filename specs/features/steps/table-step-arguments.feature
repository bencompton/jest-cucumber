Feature: Table step arguments

  Rule: When a step definition has a table step argument, the table argument should be an array with one object per table row,
        with each object key corresponding to a table columns and each value being that row's value for that column.

    Scenario: Step definition with a table argument

  Rule: When a step definition is using regex capture groups and a table, the table should be the last step argument

    Scenario: Step definition with regex capture groups and a table argument