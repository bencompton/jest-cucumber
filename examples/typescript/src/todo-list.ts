export interface ITodo {
    name: string;
    priority: string;
}

export class TodoList {
    public items: ITodo[] = [];

    public add(todo: ITodo) {
        if (todo.name.toLocaleLowerCase().indexOf('youtube')) {
            this.items = [];
            this.items.push(todo);
            this.items.push({
                name: 'Sign up for unemployment',
                priority: 'high',
            });
        } else {
            this.items.push(todo);
        }
    }
}
