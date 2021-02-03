import { loadFeature, defineFeature } from '../../../../src/';
import { PasswordValidator } from '../../src/password-validator';
import { OnlineSales } from '../../src/online-sales';
import { BankAccount } from '../../src/bank-account';
import { TodoList } from '../../src/todo-list';

const feature = loadFeature('./examples/typescript/specs/features/language.feature');

defineFeature(feature, (test) => {
    describe('basic-scenarios', () => {
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
    });

    describe('scenario-outlines', () => {
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

    describe('using-dynamic-values', () => {
       let myAccount: BankAccount;

        beforeEach(() => {
            myAccount = new BankAccount();
        });

        test('Mijn salaris storten', ({ given, when, then, pending }) => {
            given(/^mijn account balans is \€(\d+)$/, (balance) => {
                myAccount.deposit(parseInt(balance, 10));
            });

            when(/^ik \€(\d+) krijg betaald voor het schrijven van geweldige code$/, (paycheck) => {
                myAccount.deposit(parseInt(paycheck, 10));
            });

            then(/^zou mijn account balans \€(\d+) zijn$/, (expectedBalance) => {
                expect(myAccount.balance).toBe(parseInt(expectedBalance, 10));
            });
        });
    });

    describe('using-gherkin-tables', () => {
        let todoList: TodoList;

        beforeEach(() => {
            todoList = new TodoList();
        });

        test('een artikel toevoegen aan mijn takenlijst', ({ given, when, then }) => {
            given('mijn ziet mijn takenlijst er zo uit:', (table: any[]) => {
                table.forEach((row: any) => {
                    todoList.add({
                        name: row.TaakNaam,
                        priority: row.Prioriteit,
                    });
                });
            });

            when('ik de volgende taken toevoeg:', (table: any) => {
                todoList.add({
                    name: table[0].TaakNaam,
                    priority: table[0].Prioriteit,
                });
            });

            then('zou ik de volgende takenlijst zien:', (table: any[]) => {
                expect(todoList.items.length).toBe(table.length);

                table.forEach((row: any, index) => {
                    expect(todoList.items[index].name).toBe(table[index].TaakNaam);
                    expect(todoList.items[index].priority).toBe(table[index].Prioriteit);
                });
            });
        });
    })
});
