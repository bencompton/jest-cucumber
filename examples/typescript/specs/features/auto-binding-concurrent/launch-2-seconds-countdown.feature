Feature: Launch 2 secs countdown

    Scenario: Setting 2 seconds countdown 
        Given I have set a "2" seconds countdown for my satellite
        When I start the countdown
        Then my satellite should be launched to space on countdown completion
