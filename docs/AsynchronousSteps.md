# Asynchronous Steps

Jest Cucumber supports returning promises or using async/await from steps that have asynchronous operations:

```javascript
defineFeature(feature, test => {	
  test('Adding a todo', ({ given, when, then }) => {
    ...

    when('I save my changes', async () => {
      await todo.saveChanges();
      console.log('Changes saved!');
    });

    ...
  });
});
```

```javascript
defineFeature(feature, test => {	
  test('Adding a todo', ({ given, when, then }) => {
    ...

    when('I save my changes', () => {
      return todo
        .saveChanges()
        .then(() => console.log('Changes saved'));
    });

    ...
  });
});
```

Jest Cucumber does not support callbacks, but when steps are running asynchronous code that uses callbacks, the simplest solution is to wrap that code in a promise:

```javascript
defineFeature(feature, test => {	
  test('Adding a todo', ({ given, when, then }) => {
    ...

    when('I save my changes', () => {
      return new Promise((resolve) => {
        todo.saveChanges(() => {
            console.log('Changes saved');
            resolve();
        });
      });
    });

    ...
  });
});
```

You can also control how long Jest will wait for asynchronous operations before failing your test by passing a timeout (milliseconds) into your test:

```javascript
defineFeature(feature, test => {	
  test('Adding a todo', ({ given, when, then }) => {
    ...

    when('I save my changes', async () => {
      await todo.saveChanges();
      console.log('Changes saved!');
    });

    ...
  }, 1000);
});
```

In addition, you can set a [default timeout](https://jestjs.io/docs/en/configuration.html#testtimeout-number) for all of your asynchronous tests in your Jest configuration.
