import { defineFeature, loadFeature } from 'jest-cucumber';

import { BankAccount } from '../../src/bank-account';

const feature = loadFeature('./specs/features/using-dynamic-values.feature');

defineFeature(feature, test => {
    let myAccount;
		
    beforeEach(() => {
        myAccount = new BankAccount();
    });

    test('Depositing a paycheck', ({ given, when, then, pending }) => {
        given(/^my account balance is \$(\d+)$/, balance => {
            myAccount.deposit(parseInt(balance));
        });

        when(/^I get paid \$(\d+) for writing some awesome code$/, paycheck => {
            myAccount.deposit(parseInt(paycheck));
        });

        then(/^my account balance should be \$(\d+)$/, expectedBalance => {
            expect(myAccount.balance).toBe(parseInt(expectedBalance));
        });
    });    
});