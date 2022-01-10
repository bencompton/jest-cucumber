Feature: Launch countdown

    Scenario: Setting 4 seconds countdown
        Given I have set a "4" seconds countdown for my satellite
        When I start the countdown
        Then my satellite should be launched to space on countdown completion