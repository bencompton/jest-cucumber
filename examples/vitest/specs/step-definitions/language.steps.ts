// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, beforeEach } from 'vitest';
import { loadFeature, defineFeature } from '../../../../src';
import { PasswordValidator } from '../../src/password-validator';
import { OnlineSales } from '../../src/online-sales';
import { BankAccount } from '../../src/bank-account';
import { TodoList } from '../../src/todo-list';

const feature = loadFeature('./examples/typescript/specs/features/language.feature');

type TestDate = {
  TaakNaam: string;
  Prioriteit: string;
};

defineFeature(feature, test => {
  let passwordValidator = new PasswordValidator();
  let accessGranted = false;
  let myAccount: BankAccount;
  let todoList: TodoList;

  beforeEach(() => {
    passwordValidator = new PasswordValidator();
    myAccount = new BankAccount();
    todoList = new TodoList();
  });

  test('Invullen van een correct wachtwoord', ({ given, when, then }) => {
    given('ik heb voorheen een wachtwoord aangemaakt', () => {
      passwordValidator.setPassword('1234');
    });

    when('ik het correcte wachtwoord invoer', () => {
      accessGranted = passwordValidator.validatePassword('1234');
    });

    then('krijg ik toegang', () => {
      expect(accessGranted).toBeTruthy();
    });
  });

  test('Verkoop <Artikel> voor €<Bedrag>', ({ given, when, then }) => {
    const onlineSales = new OnlineSales();
    let salesPrice: number | null;

    given(/^ik heb een (.*)$/, item => {
      onlineSales.listItem(item);
    });

    when(/^ik (.*) verkoop$/, item => {
      salesPrice = onlineSales.sellItem(item);
    });

    then(/^zou ik €(\d+) ontvangen$/, expectedSalesPrice => {
      expect(salesPrice).toBe(parseInt(expectedSalesPrice, 10));
    });
  });

  test('Mijn salaris storten', ({ given, when, then }) => {
    given(/^mijn account balans is €(\d+)$/, balance => {
      myAccount.deposit(parseInt(balance, 10));
    });

    when(/^ik €(\d+) krijg betaald voor het schrijven van geweldige code$/, paycheck => {
      myAccount.deposit(parseInt(paycheck, 10));
    });

    then(/^zou mijn account balans €(\d+) zijn$/, expectedBalance => {
      expect(myAccount.balance).toBe(parseInt(expectedBalance, 10));
    });
  });

  test('een artikel toevoegen aan mijn takenlijst', ({ given, when, then }) => {
    given('mijn ziet mijn takenlijst er zo uit:', (table: TestDate[]) => {
      table.forEach(row => {
        todoList.add({
          name: row.TaakNaam,
          priority: row.Prioriteit,
        });
      });
    });

    when('ik de volgende taken toevoeg:', (table: TestDate[]) => {
      todoList.add({
        name: table[0].TaakNaam,
        priority: table[0].Prioriteit,
      });
    });

    then('zou ik de volgende takenlijst zien:', (table: TestDate[]) => {
      expect(todoList.items).toHaveLength(table.length);

      table.forEach((_, index) => {
        expect(todoList.items[index].name).toBe(table[index].TaakNaam);
        expect(todoList.items[index].priority).toBe(table[index].Prioriteit);
      });
    });
  });
});
