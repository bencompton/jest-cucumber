import { loadFeature, defineFeature } from '../../../../src/';
import { PasswordValidator } from '../../src/password-validator';
import { OnlineSales } from '../../src/online-sales';

const feature = loadFeature('./examples/typescript/specs/features/language.feature');

defineFeature(feature, (test) => {
    let passwordValidator = new PasswordValidator();
    let accessGranted = false;

    beforeEach(() => {
        passwordValidator = new PasswordValidator();
    });

    test('Invullen van een correct wachtwoord', ({ given, when, then }) => {
        given('ik heb voorheen een wachtwoord aangemaakt', () => {
            passwordValidator.setPassword('1234');
        });

        when('ik het correcte wachtwoord invoer', () => {
            accessGranted = passwordValidator.validatePassword('1234');
        });

        then('krijg ik toegang', () => {
            expect(accessGranted).toBe(true);
        });
    });

    test('Verkoop <Artikel> voor €<Bedrag>', ({ given, when, then }) => {
        let onlineSales = new OnlineSales();
        let salesPrice: number | null;

        given(/^ik heb een (.*)$/, (item) => {
            onlineSales.listItem(item);
        });

        when(/^ik (.*) verkoop$/, (item) => {
            salesPrice = onlineSales.sellItem(item);
        });

        then(/^zou ik €(\d+) ontvangen$/, (expectedSalesPrice) => {
            expect(salesPrice).toBe(parseInt(expectedSalesPrice, 10));
        });
    });
});
