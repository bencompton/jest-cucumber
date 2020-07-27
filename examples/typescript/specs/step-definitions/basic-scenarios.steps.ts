import { loadFeature, defineFeature } from '../../../../src/';
import { PasswordValidator } from '../../src/password-validator';

const feature = loadFeature('./examples/typescript/specs/features/basic-scenarios.feature');

defineFeature(feature, (test) => {
    let passwordValidator = new PasswordValidator();
    let accessGranted = false;

    beforeEach(() => {
        passwordValidator = new PasswordValidator();
    });

    test('Entering a correct password', ({ given, when, then }) => {
        given('I have previously created a password', () => {
            passwordValidator.setPassword('1234');
        });

        when('I enter my password correctly', () => {
            accessGranted = passwordValidator.validatePassword('1234');
        });

        then('I should be granted access', () => {
            expect(accessGranted).toBe(true);
        });
    });
});
