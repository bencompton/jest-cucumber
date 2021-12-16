Feature: Vending machine

  Rule: Dispenses items if correct amount of money is inserted

      Scenario: Selecting a snack
          Given the vending machine has "Maltesers" in stock
          And I have inserted the correct amount of money
          When I select "Maltesers"
          Then my "Maltesers" should be dispensed

      Scenario Outline: Selecting a beverage
          Given the vending machine has "<beverage>" in stock
          And I have inserted the correct amount of money
          When I select "<beverage>"
          Then my "<beverage>" should be dispensed

          Examples:
          | beverage   |
          | Cola       |
          | Ginger ale |
  
  Rule: Returns my money if item is out of stock

      Scenario: Selecting a snack
          Given the vending machine has no "Maltesers" in stock
          And I have inserted the correct amount of money
          When I select "Maltesers"
          Then my money should be returned

      Scenario: Selecting a beverage
          Given the vending machine has no "Cola" in stock
          And I have inserted the correct amount of money
          When I select "Cola"
          Then my money should be returned
