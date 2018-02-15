import { defineFeature, loadFeature } from 'jest-cucumber';

import { BankAccount } from '../../src/bank-account';

const feature = loadFeature('./specs/features/using-dynamic-values.feature');

defineFeature(feature, test => {
    let myAccount: BankAccount;
		
    beforeEach(() => {
        myAccount = new BankAccount();
    });

    test('Depositing a paycheck', ({ given, when, then }) => {
        given(/^my account balance is \$(.*)$/, accountBalance => {
            myAccount.deposit(parseInt(accountBalance));
        });

        when(/^I get paid \$(.*) for writing some awesome code$/, amount => {
            myAccount.deposit(parseInt(amount));
        });

        then(/^my account balance should be \$(.*)$/, accountBalance => {
            expect(myAccount.balance).toBe(parseInt(accountBalance));
        });
    });
});