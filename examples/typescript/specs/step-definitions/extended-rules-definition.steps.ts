import { loadFeature, defineRuleBasedFeature } from '../../../../src';
import { DefineStepFunction } from '../../../../src/feature-definition-creation';
import { VendingMachine } from '../../src/vending-machine';

const feature = loadFeature('./examples/typescript/specs/features/extended-rules-definition.feature', {collapseRules: false});

defineRuleBasedFeature(feature, (rule) => {
    let vendingMachine: VendingMachine;

    const myMoney = 0.50;

    const givenTheVendingMachineHasXInStock = (given: DefineStepFunction) => {
        given(/^the vending machine has "([^"]*)" in stock$/, (itemName: string) => {
            vendingMachine = new VendingMachine();
            vendingMachine.stockItem(itemName, 1);
        });
    };

    const givenTheVendingMachineHasNoXInStock = (given: DefineStepFunction) => {
        given(/^the vending machine has no "([^"]*)" in stock$/, (itemName: string) => {
            vendingMachine = new VendingMachine();
            vendingMachine.stockItem(itemName, 0);
        });
    }

    const givenIHaveInsertedTheCorrectAmountOfMoney = (given: DefineStepFunction) => {
        given('I have inserted the correct amount of money', () => {
            vendingMachine.insertMoney(myMoney);
        });
    };

    const whenISelectX = (when: DefineStepFunction) => {
        when(/^I select "(.*)"$/, (itemName: string) => {
            vendingMachine.dispenseItem(itemName);
        });
    };

    const thenXShouldBeDespensed = (then: DefineStepFunction) => {
        then(/^my "(.*)" should be dispensed$/, (itemName: string) => {
            const inventoryAmount = vendingMachine.items[itemName];
            expect(inventoryAmount).toBe(0);
        });
    }

    const thenMyMoneyShouldBeReturned = (then: DefineStepFunction) => {
        then(/^my money should be returned$/, () => {
            const returnedMoney = vendingMachine.moneyReturnSlot;
            expect(returnedMoney).toBe(myMoney);
        });
    }

    rule("Dispenses items if correct amount of money is inserted", (test) => {

        test('Selecting a snack', ({ given, and, when, then }) => {
            givenTheVendingMachineHasXInStock(given);
            givenIHaveInsertedTheCorrectAmountOfMoney(given);
            whenISelectX(when);
            thenXShouldBeDespensed(then);
        });

        test('Selecting a beverage', ({ given, and, when, then }) => {
            givenTheVendingMachineHasXInStock(given);
            givenIHaveInsertedTheCorrectAmountOfMoney(given);
            whenISelectX(when);
            thenXShouldBeDespensed(then);
        });
    });

    rule("Returns my money if item is out of stock", (test) => {

        test('Selecting a snack', ({ given, and, when, then }) => {
            givenTheVendingMachineHasNoXInStock(given);
            givenIHaveInsertedTheCorrectAmountOfMoney(given);
            whenISelectX(when);
            thenMyMoneyShouldBeReturned(then);
        });

        test('Selecting a beverage', ({ given, and, when, then }) => {
            givenTheVendingMachineHasNoXInStock(given);
            givenIHaveInsertedTheCorrectAmountOfMoney(given);
            whenISelectX(when);
            thenMyMoneyShouldBeReturned(then);
        });
    });
});
