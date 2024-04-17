// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'vitest';
import { autoBindSteps, loadFeature, StepDefinitionsWithContext } from '../../../../../src';
import { VendingMachine } from '../../../src/vending-machine';

type Context = {
  vendingMachine: VendingMachine;
};

export const vendingMachineSteps: StepDefinitionsWithContext<Context> = ({ given, and, when, then, context }) => {
  given(/^the vending machine has "(.*)" in stock$/, (itemName: string) => {
    context.vendingMachine = new VendingMachine();
    context.vendingMachine.stockItem(itemName, 1);
  });

  and('I have inserted the correct amount of money', () => {
    context.vendingMachine.insertMoney(0.5);
  });

  when(/^I purchase "(.*)"$/, (itemName: string) => {
    context.vendingMachine.dispenseItem(itemName);
  });

  then(/^my "(.*)" should be dispensed$/, (itemName: string) => {
    const inventoryAmount = context.vendingMachine.items[itemName];
    expect(inventoryAmount).toBe(0);
  });
};

const features = loadFeature('./examples/typescript/specs/features/auto-binding/snack-vending-machine.feature');

autoBindSteps(features, [vendingMachineSteps]);
