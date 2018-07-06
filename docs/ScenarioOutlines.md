# Scenario outlines

```gherkin
Feature: Online sales

Scenario Outline: Selling an item
  Given I have a(n) <Item>
  When I sell the <Item>
  Then I should get $<Amount>

  Examples:

  | Item                                           | Amount |
  | Autographed Neil deGrasse Tyson book           | 100    |
  | Rick Astley t-shirt                            | 22     |
  | An idea to replace EVERYTHING with blockchains | $0     |
```

```javascript
import { defineFeature, loadFeature } from 'jest-cucumber';
import { OnlineSales} from '../OnlineSales';

const feature = loadFeature('./features/OnlineSales.feature');

defineFeature(feature, test => {
  let onlineSales;
  let salesPrice;
		
  beforeEach(() => {
    onlineSales = new OnlineSales();
  });

  test('Selling an item', ({ given, when, then }) => {
    given(/^I have a\(n\) (.*)$/, itemName => {
      onlineSales.listItem(itemName);
    });

    when(/^I sell the (.*)$/, itemName, => {
      salesPrise = onlineSales.sell(itemName);
    });

    then(/^I should get \$(\d+)$/, amount => {
      expect(salesPrice).toBe(amount);
    });
  });
});
```