import { defineFeature, loadFeature } from 'jest-cucumber';
import { OnlineSales } from '../../src/online-sales';

const feature = loadFeature('./specs/features/scenario-outlines.feature');

defineFeature(feature, test => {
    let onlineSales: OnlineSales;
    let salesPrice: number | null;
		
    beforeEach(() => {
        onlineSales = new OnlineSales();
    });

    test('Selling an item', ({ given, when, then, pending }) => {
        given(/^I have a\(n\) (.*)$/, item => {
            onlineSales.listItem(item);
        });

        when(/^I sell the (.*)$/, item => {
            salesPrice = onlineSales.sellItem(item);
        });

        then(/^I should get \$(.*)$/, expectedSalesPrice => {
            expect(salesPrice).toBe(parseInt(expectedSalesPrice));
        });
    });    
});