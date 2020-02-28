Feature: Series Solver

Scenario Outline: Solving series
    Given I have a series <First> <Operator> <Second> <Operator> <Third> <Operator> ...
    When I solve the series
    Then I should get <Solution> as the answer

    Examples:

      | First | Second | Third | Operator | Solution |
      | 1     | 2      | 3     | +        | -1/12    |
      | 1     | 1/2    | 1/4   | +        | 2        |
      | 1/0!  | 1/1!   | 1/2!  | +        | e        |
