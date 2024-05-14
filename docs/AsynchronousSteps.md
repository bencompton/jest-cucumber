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

## Callbacks

Jest Cucumber also supports callbacks for asynchronous tasks. If an additional callback parameter is defined on the step function, it will wait for that callback to be called to continue with the next step:

```javascript
defineFeature(feature, test => {	
  test('Adding a todo', ({ given, when, then }) => {
    ...

    when('I save my changes', done => {
      todo.saveChanges(() => {
          console.log('Changes saved');
          done(); // When the callback is called, the step will end
      });
    });

    ...
  });
});
```

The callback should always be the last parameter:

```javascript
defineFeature(feature, test => {	
  test('Adding a todo', ({ given, when, then }) => {
    ...

    when(/I save my changes with name (\w+)/, (name, done) => {
      todo.saveChanges(() => {
          console.log(`Changes saved with name ${name}`);
          done();
      });
    });

    ...
  });
});
```

Like in jest, if an argument is passed to the callback function, it will fail the test:

```javascript
defineFeature(feature, test => {	
  test('Adding a todo', ({ given, when, then }) => {
    ...

    when('I save my changes', done => {
      todo.saveChanges(error => {
          if (error) {
            done(error); // the test will fail if called with an argument
          } else {
            console.log(`Changes saved`);
            done(); // the test will succeed if no argument is passed
          }
      });
    });

    ...
  });
});
```

## Timeout

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
