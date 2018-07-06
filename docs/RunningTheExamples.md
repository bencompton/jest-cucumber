# Running the examples

Note that examples are provided in both ECMAScript and TypeScript.

First, build jest-cucumber: 

```
$ npm install
$ npm run build
```

## Running examples from the CMD line


### TypeScript examples

```
$ npm test
```

### EcmaScript examples

```
$ cd examples/ecmascript
$ npm install
$ npm test
```

## Running via Visual Studio Code Jest extension

1. Ensure that running the tests from the CMD line works (see above)

2. Install the [VS Code Jest extension](https://github.com/jest-community/vscode-jest) according to the official instructions

3. Open the root directory of the project in VS Code in execute the TypeScript examples. In order to run the EcmaScript examples, you will need to open the examples/ecmascript directory in VS Code (if you open the root, the extension won't find the tests).

4. The extension should perform an initial test run the directories above are opened. Afterwards, you should be able to navigate to the step definitions and see that they are passing, edit them to make them fail, etc.

## Running via Majestic

1. Ensure that running the tests from the CMD line works (see above)

2. Download and install [Majestic](https://github.com/Raathigesh/majestic) according to the official instructions

3. For the TypeScript examples, open the root project directory in Majestic. To run the EcmaScript examples, open the examples/ecmascript directory in Majestic.

4. Run all tests in Majestic. You should see that all of the tests passed in the "Execution Summary". You can then run, edit, and debug (see below) individual tests as you desire.

5. Optionally also install the [Majestic VS Code extension](https://github.com/Raathigesh/majestic#debug-in-vs-code) if you wish to debug in VS Code. To debug the TypeScript examples, you will need to load the root project directory in VS Code. To run the EcmaScript examples, you will need to load the examples/ecmascript directory in VS Code.
