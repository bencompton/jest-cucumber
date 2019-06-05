Feature: Online sales

Scenario Outline: Selling an item at $<Amount>
    Given I have a(n) <Item>
    When I sell the <Item>
    Then I should get $<Amount>

    Examples:

    | Item                                           | Amount |
    | Autographed Neil deGrasse Tyson book           | 100    |
    | Rick Astley t-shirt                            | 22     |
    | An idea to replace EVERYTHING with blockchains | 0      |