// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, beforeEach } from 'vitest';
import { defineFeature, loadFeature } from '../../../../src';
import { TodoList } from '../../src/todo-list';

const feature = loadFeature('./examples/typescript/specs/features/using-gherkin-tables.feature');

type TestDate = {
  TaskName: string;
  Priority: string;
};

defineFeature(feature, test => {
  let todoList: TodoList;

  beforeEach(() => {
    todoList = new TodoList();
  });

  test('Adding an item to my todo list', ({ given, when, then }) => {
    given('my todo list currently looks as follows:', (table: TestDate[]) => {
      table.forEach(row => {
        todoList.add({
          name: row.TaskName,
          priority: row.Priority,
        });
      });
    });

    when('I add the following task:', (table: TestDate[]) => {
      todoList.add({
        name: table[0].TaskName,
        priority: table[0].Priority,
      });
    });

    then('I should see the following todo list:', (table: TestDate[]) => {
      expect(todoList.items).toHaveLength(table.length);

      table.forEach((_, index) => {
        expect(todoList.items[index].name).toBe(table[index].TaskName);
        expect(todoList.items[index].priority).toBe(table[index].Priority);
      });
    });
  });
});
