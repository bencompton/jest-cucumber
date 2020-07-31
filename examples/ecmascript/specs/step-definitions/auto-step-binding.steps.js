import { loadFeatures, autoBindSteps } from 'jest-cucumber';
import { VendingMachine } from '../../src/vending-machine';

export const vendingMachineSteps = ({ given, and, when, then }) => {
    let vendingMachine;

    given(/^the vending machine has "(.*)" in stock$/, (itemName) => {
        vendingMachine = new VendingMachine();
        vendingMachine.stockItem(itemName, 1);
    });

    and('I have inserted the correct amount of money', () => {
        vendingMachine.insertMoney(0.50);
    });

    when(/^I purchase "(.*)"$/, (itemName) => {
        vendingMachine.dispenseItem(itemName);
    });

    then(/^my "(.*)" should be dispensed$/, (itemName) => {
        const inventoryAmount = vendingMachine.items[itemName];
        expect(inventoryAmount).toBe(0);
    });
};

const features = loadFeatures('./specs/features/auto-binding/**/*.feature');

autoBindSteps(features, [ vendingMachineSteps ]);
