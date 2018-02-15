# Jest Cucumber

Execute Gherkin scenarios in Jest

<img src="./images/jest-cucumber-demo.gif?raw=true" alt="Cucumber Jest Demo" width="100%" />

## Motivation

Jest is an excellent test runner with great features like parallel test execution, mocking, snapshots, code coverage, etc. If you're using VS Code, there's also a terrific [Jest extension](https://github.com/jest-community/vscode-jest) that allows you get realtime feedback as you're writing your tests and easily debug failing tests individually. Cucumber is a popular tool for doing Acceptance Test-Driven Development and creating business-readable executable specifications. This library aims to achieve the best of both worlds, and even run your unit tests and acceptance tests in the same test runner.

## Getting Started

### Install Jest Cucumber:

```
npm install jest-cucumber
```

### Add a Feature file:

```gherkin
Feature: Rocket Launching

Scenario: Launching a SpaceX rocket
  Given I am Elon Musk attempting to launch a rocket into space
  When I launch the rocket
  Then the rocket should end up in space
  And the booster(s) should land back on the launch pad
  And nobody should doubt me ever again
```

### Add the following to your Jest configuration:

```javascript  
  "testMatch": [
    "**/*.steps.js"
  ],
```

### Add a file with your step definitions:

```javascript
//rocket-launching.spec.js

import { defineFeature, loadFeature } from 'cucumber-jest';
import Rocket from '../Rocket';

const feature = loadFeature('./features/RocketLaunching.feature');

defineFeature(feature, test => {
  test('Launching a SpaceX rocket', ({ given, when, then }) => {
    let rocket;

    given('I am Elon Musk attempting to launch a rocket into space', () => {
      rocket = new Rocket();
    });

    when('I launch the rocket', () => {
      rocket.launch();
    });

    then('the rocket should end up in space', () => {
      expect(rocket.isInSpace).toBe(true);
    });

    then('the booster(s) should land back on the launch pad', () => {
      expect(rocket.boostersLanded).toBe(true);
    });

    then('nobody should doubt me ever again', () => {
      expect('people').not.toBe('haters');
    });
  });
});
```

## More Examples

### Using dynamic values

```gherkin
Feature: Getting rich writing software

Scenario: Depositing a paycheck
  Given my account balance is $10
  When I get paid $1000000 for writing some awesome code
  Then my account balance should be $1000010
```

```javascript
import { defineFeature, loadFeature } from 'cucumber-jest';
import BankAccount from '../BankAccount';

const feature = loadFeature('./features/GettingRichWritingSoftware.feature');

defineFeature(feature, test => {
  let myAccount;
		
  beforeEach(() => {
    myAccount = new BankAccount();
  });

  test('Depositing a paycheck', ({ given, when, then }) => {
    given(/^my account balance is \$(.*)$/, accountBalance => {
      myAccount.deposit(parseInt(accountBalance));
    });

    when(/^I get paid \$(.*) for writing awesome code$/, amount, => {
      myAccount.deposit(parseInt(amount));
    });

    then(/^my account balance should be \$(.*)$/, accountBalance => {
      expect(myAccount.balance).toBe(parseInt(accountBalance));
    });
  });
});
```

### Using Gherkin tables

```gherkin
Feature: Todo List

Scenario: Adding an item to my todo list
  Given my todo list currently looks as follows:
  | TaskName            | Priority |
  | Fix bugs in my code | medium   |
  | Document my hours   | medium   |
  When I add the following task:
  | TaskName                              | Priority |
  | Watch cat videos on YouTube all day   | high     |
  Then I should see the following todo list:
  | TaskName                              | Priority |  
  | Watch cat videos on YouTube all day   | high     |
  | Sign up for unemployment              | high     |
```

### Scenario outlines

```gherkin
Feature: Online sales

Scenario Outline: Selling an item
  Given I have a(n) <Item>
  When I sell the <Item>
  Then I should get $<Amount>

  Examples:

  | Item                                           | Amount |
  | Autographed Neil deGrasse Tyson book           | 100    |
  | Rick Astley t-shirt                            | 22     |
  | An idea to replace EVERYTHING with blockchains | $0     |
```

### Re-using step definitions

Cucumber Jest expects you to define all of your step definitions inline for each scenario exactly as they are defined in your feature file. This makes your automation code easy to read: it reads pretty much like your feature file. However, there will often be cases where the same steps are repeated in multiple scenarios.

It is normally recommended that your test code contain as little logic as possible, with common setup logic abstracted into other modules (e.g., test data creation), so there really shouldn't be much duplicated code in the first place. To further reduce duplicated code, you could do something like this:

```javascript
defineFeature(feature, test => {
  let myAccount;
		
  beforeEach(() => {
    myAccount = new BankAccount();
  });
	
  const givenIHaveMoneyInMyBankAccount = given => {
    given(/I have \$(.*) in my bank account/, balance => {
      myAccount.deposit(balance);
    });
  };

  const thenMyBalanceShouldBe = then => {
    then(/my balance should be \$(.*)/, balance => {
      expect(myAccount.balance).toBe(balance);
    });
  };

  test('Making a deposit', ({ given, when, then }) => {
    givenIHaveMoneyInMyBankAccount(given);

    when(/I deposit \$(.*)/, deposit => {
      myAccount.deposit(deposit);
    });

    thenMyBalanceShouldBe(then);
  });
	
  test('Making a withdrawal', ({ given, when, then }) => {
    givenIHaveDollarsInMyBankAccount(given);

    when(/I withdraw \$(.*)/, withdrawal => {
      myAccount.withdraw(withdrawal);
    });		

    thenMyBalanceShouldBe(then);
  });
});
```
