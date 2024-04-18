Feature: Beverage vending machine

    Scenario Outline: Purchasing a beverage
        Given the vending machine has "<beverage>" in stock
        And I have inserted the correct amount of money
        When I purchase "<beverage>"
        Then my "<beverage>" should be dispensed

        Examples:
        | beverage   |
        | Cola       |
        | Ginger ale |