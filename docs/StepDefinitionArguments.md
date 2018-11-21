## Step definition arguments

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
    given(/^my account balance is \$(\d+)$/, accountBalance => {
      myAccount.deposit(parseInt(accountBalance));
    });

    when(/^I get paid \$(\d+) for writing awesome code$/, amount => {
      myAccount.deposit(parseInt(amount));
    });

    then(/^my account balance should be \$(\d+)$/, accountBalance => {
      expect(myAccount.balance).toBe(parseInt(accountBalance));
    });
  });
});
```
