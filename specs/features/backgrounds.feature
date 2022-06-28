Feature: Backgrounds

  Rule: When a background is under a feature, all scenario step definitions within the feature must include the steps from the background
        as though they were defined in each scenario itself

      Scenario: Feature background - scenario with correct steps
      Scenario: Feature background - scenario missing steps

  Rule: When a background is under a rule, all scenario step definitions within the rule must include the steps from the background
        as though they were defined in each scenario itself

      Scenario: Rule background - scenario with correct steps
      Scenario: Rule background - scenario with missing steps

  Rule: When a background is under a feature, and another background is under a rule, all scenario step definitions within the rule must 
        include the steps from both backgrounds as though they were defined in each scenario itself

    Scenario: Nested background - scenario with correct steps
    Scenario: Nested background - scenario missing feature steps
    Scenario: Nested background - scenario missing rule steps

  Rule: When both the feature and the rule have a background, scenarios must have feature background steps before rule background steps

    Scenario: Nested background - scenario with steps in the correct order
    Scenario: Nested background - scenario with steps out of order