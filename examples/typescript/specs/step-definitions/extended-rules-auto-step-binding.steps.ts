import { StepDefinitions, loadFeature, autoBindSteps} from '../../../../src';
import { VendingMachine } from '../../src/vending-machine';

export const vendingMachineSteps: StepDefinitions = ({ given, and, when, then }) => {
    let vendingMachine: VendingMachine;

    const myMoney = 0.50;

    given(/^the vending machine has "([^"]*)" in stock$/, (itemName: string) => {
        vendingMachine = new VendingMachine();
        vendingMachine.stockItem(itemName, 1);
    });

    given(/^the vending machine has no "([^"]*)" in stock$/, (itemName: string) => {
        vendingMachine = new VendingMachine();
        vendingMachine.stockItem(itemName, 0);
    });

    and('I have inserted the correct amount of money', () => {
        vendingMachine.insertMoney(myMoney);
    });

    when(/^I select "(.*)"$/, (itemName: string) => {
        vendingMachine.dispenseItem(itemName);
    });

    then(/^my money should be returned$/, () => {
        const returnedMoney = vendingMachine.moneyReturnSlot;
        expect(returnedMoney).toBe(myMoney);
    });

    then(/^my "(.*)" should be dispensed$/, (itemName: string) => {
        const inventoryAmount = vendingMachine.items[itemName];
        expect(inventoryAmount).toBe(0);
    });
};

const feature = loadFeature(
    './examples/typescript/specs/features/extended-rules-auto-step-binding.feature', {
        collapseRules: false,
    });

autoBindSteps([feature], [ vendingMachineSteps ]);
