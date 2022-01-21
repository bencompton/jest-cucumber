Feature: Step definitions
  In order to convert my feature files into executable specifications that can run on top of Jest
  As an engineer
  I would like the ability to define Jest tests that execute a set of step definitions

  Rule: Steps should execute in the order that I defined them in my Jest Cucumber test

    Scenario: Scenario with multiple step definitions
      Given a scenario with multiple step definitions
      When I execute that scenario in Jest Cucumber
      Then all steps should be executed in order

  Rule: When a step throws an unhandled error, then the scenario should fail and no other steps in that scenario should execute

    Scenario: Scenario with a failing synchronous step
      Given a scenario with a failing synchronous step
      When I execute that scenario in Jest Cucumber
      Then I should see the error that occurred
      And I should see which step failed
      And no more steps should execute

  Rule: When a step returns a promise (or uses async/await), then the next step should not be executed until the promise resolves

    Scenario: Scenario with an async step
      Given a scenario with an async step
      When I execute that scenario in Jest Cucumber
      Then the next step should not execute until the promise resolves

    Scenario: Scenario with a failing async step
      Given a scenario with a failing async step
      When I execute that scenario in Jest Cucumber
      Then I should see the error that occurred
      And I should see which step failed
      And no more steps should execute