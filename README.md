# Jest Cucumber

Execute Gherkin scenarios in Jest

<img src="./images/jest-cucumber-demo.gif?raw=true" alt="Cucumber Jest Demo" width="100%" />

## Motivation

Jest is an excellent test runner with great features like parallel test execution, mocking, snapshots, code coverage, etc. If you're using VS Code, there's also a terrific [Jest extension](https://github.com/jest-community/vscode-jest) that allows you get realtime feedback as you're writing your tests and easily debug failing tests individually. [Cucumber](https://cucumber.io) is a popular tool for doing [Acceptance Test-Driven Development](https://en.wikipedia.org/wiki/Acceptance_test–driven_development) and creating business-readable executable specifications. This library aims to achieve the best of both worlds, and even run your unit tests and acceptance tests in the same test runner.

## Getting Started

### Install Jest Cucumber:

```
npm install jest-cucumber --save-dev
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

### Add a step definition file that links to your feature file:

```javascript
//rocket-launching.steps.js

import { defineFeature, loadFeature } from 'cucumber-jest';

const feature = loadFeature('./features/RocketLaunching.feature');
```

### Add a Jest test for each scenario into your step definition file:

```javascript
//rocket-launching.steps.js

import { defineFeature, loadFeature } from 'cucumber-jest';

const feature = loadFeature('./features/RocketLaunching.feature');

defineFeature(feature, test => {
  test('Launching a SpaceX rocket', ({ given, when, then }) => {

  });
});
```

### Add step definitions to your scenario Jest tests:

```javascript
//rocket-launching.steps.js

import { defineFeature, loadFeature } from 'jest-cucumber';
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

## Additional Configuration Options

### Disabling scenario / step definition validation

Cucumber's approach is to start with your feature file and execute the step definitions in the order defined in the feature file. In contrast, jest-cucumber scenarios are merely Jest tests. In order to provide the same ability as Cucumber to keep the feature files and step definitions in sync, jest-cucumber validates your step definitions against the feature file.

By default, this step definition / feature file validation is enabled. If you have scenarios that are defined in the feature file, but not in your step definitions for that feature file, jest-cucumber will raise an error (and provide starter code). If you have scenarios defined in your step definitions for that aren't in your feature file, jest-cucumber will also raise an error. Additionally, jest-cucumber also validates that the steps you define within your scenarios match the steps that are defined in the feature file, and are in the same order. 

If you would prefer not to have this validation occur (perhaps you just want to consume Gherkin tables in your feature file, etc.), then validation can be disabled like so:

```javascript
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('./features/RocketLaunching.feature', {
  errorOnMissingScenariosAndSteps: false
});
```

### Tag filtering

jest-cucumber also has the ability to specify a tag filter. This simply causes jest-cucumber to ignore missing scenarios during validation that do not match the specified tag(s).

For example, consider the following feature file:

```gherkin
Feature: Tagged scenarios

  @included
  Scenario: Tagged scenario that is included
    Given my scenario has a tag that is included in my jest-cucumber step definitions tag filter
    But I don't have that scenario defined in my step definitions
    When I execute my jest-cucumber scenarios
    Then jest-cucumber should show me an error
  
  @not-included
  Scenario: Tagged scenario that is not included
    Given my scenario has a tag that is NOT included in my jest-cucumber step definitions tag filter
    But I don't have that scenario defined in my step definitions
    When I execute my jest-cucumber scenarios
    Then jest-cucumber should NOT show me an error
```

Consider the following step definitions file:

```javascript
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('./features/RocketLaunching.feature', {
  tagFilter: ['@included']
});

//No scenarios defined yet
```

In this case with a tag filter and no scenarios defined, jest-cucumber will raise an error about the first scenario, and will not raise an error about the second scenario.

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
import { defineFeature, loadFeature } from 'jest-cucumber';
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

```javascript
import { defineFeature, loadFeature } from 'jest-cucumber';
import TodoList from '../TodoList';

const feature = loadFeature('./features/TodoList.feature');

defineFeature(feature, test => {
  let todoList;
		
  beforeEach(() => {
    todoList = new TodoList();
  });

  test('Adding an item to my todo list', ({ given, when, then }) => {
    given('my todo list currently looks as follows:', table => {
      table.forEach(row => {
        todoList.add({
	  name: row.TaskName,
	  priority: row.Priority
	});
      });
    });

    when('I add the following task:', table => {
      todoList.add({
        name: table[0].TaskName,
	priority: table[0].Priority
      });
    });

    then('I should see the following todo list:', table => {
      expect(todoList.items.length).toBe(table.length);
    
      table.forEach((row, index) => {
        expect(todoList.items[index].name).toBe(table[index].TaskName);
	expect(todoList.items[index].priority).toBe(table[index].Priority);
      });
    });
  });
});
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

```javascript
import { defineFeature, loadFeature } from 'jest-cucumber';
import { OnlineSales} from '../OnlineSales';

const feature = loadFeature('./features/OnlineSales.feature');

defineFeature(feature, test => {
  let onlineSales;
  let salesPrice;
		
  beforeEach(() => {
    onlineSales = new OnlineSales();
  });

  test('Selling an item', ({ given, when, then }) => {
    given(/^I have a\(n\) (.*)$/, itemName => {
      onlineSales.listItem(itemName);
    });

    when(/^I sell the (.*)$/, itemName, => {
      salesPrise = onlineSales.sell(itemName);
    });

    then(/^I should get \$(.*)$/, amount => {
      expect(salesPrice).toBe(amount);
    });
  });
});
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
