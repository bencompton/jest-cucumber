import { defineFeature, loadFeature } from '../../../../src/';
import { TodoList } from '../../src/todo-list';

const feature = loadFeature('./examples/typescript/specs/features/using-gherkin-tables.feature');

defineFeature(feature, (test) => {
    let todoList: TodoList;

    beforeEach(() => {
        todoList = new TodoList();
    });

    test('Adding an item to my todo list', ({ given, when, then }) => {
        given('my todo list currently looks as follows:', (table: any[]) => {
            table.forEach((row: any) => {
                todoList.add({
                    name: row.TaskName,
                    priority: row.Priority,
                });
            });
        });

        when('I add the following task:', (table: any) => {
            todoList.add({
                name: table[0].TaskName,
                priority: table[0].Priority,
            });
        });

        then('I should see the following todo list:', (table: any[]) => {
            expect(todoList.items.length).toBe(table.length);

            table.forEach((row: any, index) => {
                expect(todoList.items[index].name).toBe(table[index].TaskName);
                expect(todoList.items[index].priority).toBe(table[index].Priority);
            });
        });
    });
});
