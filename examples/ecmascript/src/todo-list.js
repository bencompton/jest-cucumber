export class TodoList {
  constructor() {
    this.items = [];
  }

  add(todo) {
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
