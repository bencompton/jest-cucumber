import { defineFeature, loadFeature } from 'jest-cucumber';
import { OnlineSales } from '../../src/online-sales';

const feature = loadFeature('./specs/features/scenario-outlines.feature');

defineFeature(feature, test => {
    let onlineSales;
    let salesPrice;
		
    beforeEach(() => {
        onlineSales = new OnlineSales();
    });

    test('Selling an <Item> at $<Amount>', ({ given, when, then, pending }) => {
        given(/^I have a\(n\) (.*)$/, item => {
            onlineSales.listItem(item);
        });

        when(/^I sell the (.*)$/, item => {
            salesPrice = onlineSales.sellItem(item);
        });

        then(/^I should get \$(\d+)$/, expectedSalesPrice => {
            expect(salesPrice).toBe(parseInt(expectedSalesPrice));
        });
    });    
});