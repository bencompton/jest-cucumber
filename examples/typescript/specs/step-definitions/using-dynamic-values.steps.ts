import { defineFeature, loadFeature } from '../../../../src/';

import { BankAccount } from '../../src/bank-account';

const feature = loadFeature('./examples/typescript/specs/features/using-dynamic-values.feature');

defineFeature(feature, (test) => {
    let myAccount: BankAccount;

    beforeEach(() => {
        myAccount = new BankAccount();
    });

    test('Depositing a paycheck', ({ given, when, then, pending }) => {
        given(/^my account balance is \$(\d+)$/, (balance) => {
            myAccount.deposit(parseInt(balance, 10));
        });

        when(/^I get paid \$(\d+) for writing some awesome code$/, (paycheck) => {
            myAccount.deposit(parseInt(paycheck, 10));
        });

        then(/^my account balance should be \$(\d+)$/, (expectedBalance) => {
            expect(myAccount.balance).toBe(parseInt(expectedBalance, 10));
        });
    });
});
