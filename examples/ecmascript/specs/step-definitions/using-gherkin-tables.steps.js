import { defineFeature, loadFeature } from 'jest-cucumber';
import { TodoList } from '../../src/todo-list';

const feature = loadFeature('./specs/features/using-gherkin-tables.feature');

defineFeature(feature, test => {
    let todoList;
		
    beforeEach(() => {
        todoList = new TodoList();
    });

    test('Adding an item to my todo list', ({ given, when, then }) => {
        given('my todo list currently looks as follows:', table => {
            table.forEach(row => {
                todoList.add({
                    name: row.TaskName,
                    priority: row.Priority
                });
            });
        });

        when('I add the following task:', table => {
            todoList.add({
                name: table[0].TaskName,
                priority: table[0].Priority
            });
        });

        then('I should see the following todo list:', table => {
            expect(todoList.items.length).toBe(table.length);

            table.forEach((row, index) => {
                expect(todoList.items[index].name).toBe(table[index].TaskName);
                expect(todoList.items[index].priority).toBe(table[index].Priority);
            });
        });
    });
});