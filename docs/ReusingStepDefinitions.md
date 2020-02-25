# Re-using step definitions

Jest Cucumber expects you to define all of your step definitions inline for each scenario exactly as they are defined in your feature file. This makes your automation code easy to read: it reads pretty much like your feature file. However, there will often be cases where the same steps are repeated in multiple scenarios.

It is normally recommended that your test code contain as little logic as possible, with common setup logic abstracted into other modules (e.g., test data creation), so there really shouldn't be much duplicated code in the first place. To further reduce duplicated code, you could do something like this:

```javascript
defineFeature(feature, test => {
  let myAccount;
		
  beforeEach(() => {
    myAccount = new BankAccount();
  });
	
  const givenIHaveXDollarsInMyBankAccount = (given, account) => {
    given(/I have \$(\d+) in my bank account/, balance => {
      account.deposit(parseInt(balance));
    });
  };

  const thenMyBalanceShouldBe = (then, account) => {
    then(/my balance should be \$(\d+)/, balance => {
      expect(account.balance).toBe(parseInt(balance));
    });
  };

  test('Making a deposit', ({ given, when, then }) => {
    givenIHaveXDollarsInMyBankAccount(given, myAccount);

    when(/I deposit \$(\d+)/, deposit => {
      myAccount.deposit(parseInt(deposit));
    });

    thenMyBalanceShouldBe(then, myAccount);
  });
	
  test('Making a withdrawal', ({ given, when, then }) => {
    givenIHaveXDollarsInMyBankAccount(given, myAccount);

    when(/I withdraw \$(\d+)/, withdrawal => {
      myAccount.withdraw(withdrawal);
    });		

    thenMyBalanceShouldBe(then, myAccount);
  });
});
```
It may be necessary to manage by yourself the `BeforeEach` step because of the order and timing how this function is called. 

If you need to re-use the same step definitions across multiple feature files, a useful approach is to place shared step definitions in a shared module and import them when needed:

```javascript
// shared-steps.js
	
export const givenIHaveXDollarsInMyBankAccount = (given, account) => {
  given(/I have \$(\d+) in my bank account/, balance => {
    account.deposit(balance);
  });
};

export const thenMyBalanceShouldBe = (then, account) => {
  then(/my balance should be \$(\d+)/, balance => {
    expect(account.balance).toBe(parseInt(balance));
  });
};
```

```javascript
// example.steps.js

import { thenMyBalanceShouldBe, givenIHaveXDollarsInMyBankAccount } from './shared-steps';

defineFeature(feature, test => {
  let myAccount;
		
  beforeEach(() => {
    myAccount = new BankAccount();
  });

  test('Making a deposit', ({ given, when, then }) => {
    givenIHaveXDollarsInMyBankAccount(given, myAccount);

    when(/I deposit \$(\d+)/, deposit => {
      myAccount.deposit(deposit);
    });

    thenMyBalanceShouldBe(then, myAccount);
  });
	
  test('Making a withdrawal', ({ given, when, then }) => {
    givenIHaveXDollarsInMyBankAccount(given, myAccount);

    when(/I withdraw \$(\d+)/, withdrawal => {
      myAccount.withdraw(withdrawal);
    });		

    thenMyBalanceShouldBe(then, myAccount);
  });
});
```
