Feature: Snack vending machine

    Scenario: Purchasing a snack
        Given the vending machine has "Maltesers" in stock
        And I have inserted the correct amount of money
        When I purchase "Maltesers"
        Then my "Maltesers" should be dispensed