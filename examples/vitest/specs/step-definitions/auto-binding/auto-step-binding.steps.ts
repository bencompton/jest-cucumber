// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'vitest';
import { StepDefinitions, loadFeatures, autoBindSteps } from '../../../../../src';
import { VendingMachine } from '../../../src/vending-machine';

export const vendingMachineSteps: StepDefinitions = ({ given, and, when, then }) => {
  let vendingMachine: VendingMachine;

  given(/^the vending machine has "(.*)" in stock$/, (itemName: string) => {
    vendingMachine = new VendingMachine();
    vendingMachine.stockItem(itemName, 1);
  });

  and('I have inserted the correct amount of money', () => {
    vendingMachine.insertMoney(0.5);
  });

  when(/^I purchase "(.*)"$/, (itemName: string) => {
    vendingMachine.dispenseItem(itemName);
  });

  then(/^my "(.*)" should be dispensed$/, (itemName: string) => {
    const inventoryAmount = vendingMachine.items[itemName];
    expect(inventoryAmount).toBe(0);
  });
};

const features = loadFeatures('./examples/typescript/specs/features/auto-binding/**/*.feature');

autoBindSteps(features, [vendingMachineSteps]);
