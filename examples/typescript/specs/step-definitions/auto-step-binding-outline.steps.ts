import { StepDefinitions, autoBindSteps, loadFeature } from '../../../../src';
import { OnlineSales } from '../../src/online-sales';

export const salesSteps: StepDefinitions = ({ given, when, then }) => {
  let onlineSales: OnlineSales;
  let salesPrice: number | null;

  beforeEach(() => {
    onlineSales = new OnlineSales();
  });

  given(/^I have a\(n\) (.+)$/, (item: string) => {
    onlineSales.listItem(item);
  });

  when(/^I sell the (.+)$/, (item: string) => {
    salesPrice = onlineSales.sellItem(item);
  });

  then(/^I should get \$(\d+)$/, (expectedSalesPrice: string) => {
    expect(salesPrice).toBe(parseInt(expectedSalesPrice, 10));
  });
};

const feature = loadFeature('./examples/typescript/specs/features/scenario-outlines.feature');

autoBindSteps([feature], [salesSteps]);
