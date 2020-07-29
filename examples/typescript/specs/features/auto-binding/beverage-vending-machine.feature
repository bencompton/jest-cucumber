Feature: Beverage vending machine

    Scenario: Purchasing a beverage
        Given the vending machine has "Pepsi" in stock
        And I have inserted the correct amount of money
        When I purchase "Pepsi"
        Then my "Pepsi" should be dispensed