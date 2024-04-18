Feature: Getting rich writing software

Scenario: Depositing a paycheck
    Given my account balance is $10
    When I get paid $1000000 for writing some awesome code
    Then my account balance should be $1000010