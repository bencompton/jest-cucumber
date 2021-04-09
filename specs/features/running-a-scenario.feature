Feature: Running a scenario

    Scenario: Running a scenario
        Given I have a scenario
        When I run it
        Then it should run successfully

    Scenario: Scenario missing a step
        Given I have a scenario that is missing a step
        When I run it
        Then it should fail with a validation error / missing step code      