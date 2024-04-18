Feature: Arcade coin-op

    Background: Coins are required (not free mode)
        Given my machine is configured to require coins

    Rule: When a coin is inserted, the balance should increase by the amount of the coin 

        Scenario: Successfully inserting coins
            Given I have not inserted any coins
            When I insert one US Quarter
            Then I should have a balance of 25 cents

    Rule: When a coin is not recognized as valid, it should be returned

        Background:
            Given my machine is configured to accept US Quarters

        Scenario: Inserting a Canadian coin
            When I insert a Canadian Quarter
            Then my coin should be returned

        Scenario: Inserting a badly damaged coin
            When I insert a US Quarter that is badly damaged
            Then my coin should be returned